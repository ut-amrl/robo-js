-- Copyright 2017-2018 rezecib@gmail.com, jaholtz@cs.umass.edu
-- College of Information and Computer Sciences,
-- University of Massachusetts Amherst
--
--
-- This software is free: you can redistribute it and/or modify
-- it under the terms of the GNU Lesser General Public License Version 3,
-- as published by the Free Software Foundation.
--
-- This software is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU Lesser General Public License for more details.
--
-- You should have received a copy of the GNU Lesser General Public License
-- Version 3 in the file COPYING that came with this distribution.
-- If not, see <http://www.gnu.org/licenses/>.
-- ========================================================================

-- TODO(rezecib) missing components:
-- handling opponent role specifications (tactic design might eliminate need)
-- coordinate system described in STP (very vague...)
-- opportunistic behavior (immediate shooting/grabbing) - better in C++?

package.path = "./src/plays/?.lua"
local Play = require("play")

-- Copy globals passed in by C++ to locals for efficiency
-- (globals are indexed by name, while locals are indexed by number)
local log = log

package.path = "./src/plays/playbook/?.play"
log("Loading plays:")
local play_files = {
  "our_kickoff",
  "their_kickoff",
  "our_direct_free_kick",
  "their_direct_free_kick",
  "our_indirect_free_kick",
  "their_indirect_free_kick",
  "our_penalty_kick",
  "their_penalty_kick",
  "aggressive_midSide",
  "neutral_ourSide",
  "aggressive_theirSide",
  "stopped",
  "ball_placement",
  "ball_placement_them",
}

-- local play_files = {
--   "our_kickoff",
--   "their_kickoff",
--   "our_direct_free_kick",
--   "their_direct_free_kick",
--   "our_indirect_free_kick",
--   "their_indirect_free_kick",
--   "our_penalty_kick",
--   "their_penalty_kick",
--   "manuelas_advice",
--   "stopped",
-- }

-- local play_files = {
--   "our_kickoff",
--   "their_kickoff",
--   "our_direct_free_kick",
--   "their_direct_free_kick",
--   "our_indirect_free_kick",
--   "their_indirect_free_kick",
--   "our_penalty_kick",
--   "their_penalty_kick",
--   "neutral_ourSide",
--   "neutral_midSide",
--   "aggressive_theirSide",
--   "stopped",
-- }

-- local play_files = {
--   "test_passing",
-- }

local plays = {}
for i = 1, #play_files do
  log(play_files[i])
  table.insert(plays, Play(require(play_files[i])))
end

local test_play_files = {
  "test"
}

local test_plays = {}
for i = 1, #test_play_files do
  log(test_play_files[i])
  table.insert(test_plays, Play(require(test_play_files[i])))
end

local current_play = nil

-- Used by the weighted experts algorithm to adjust play weights
local applicable_plays = {}
local total_weight = 0
local outcome_multipliers = {
  initial   = 1,  -- this is a dummy for selecting the first play
  success   = 3/2,  -- scoring
  failure   = 2/3,  -- getting scored on
  completed = 11/10,
  aborted   = 10/11,
  timeout   = 10/11,
}
local predicates = {}
-- If predicate sets ever vary, then we will also need a reset_predicates
local function set_predicate(predicate_name, value)
  predicates[predicate_name] = value;
end

-- Takes a set of predicates about the current game state,
-- which are used to determine the correct play.
-- external_outcome: string; success, failure, stopped play; empty if none
-- active_tactic_completed: boolean
local function execute_play_engine(external_outcome, active_tactic_completed,
                                   test_mode)
  log("Current play: ", tostring(current_play))
  log("active tactic Completed: ", tostring(active_tactic_completed))
  if test_mode then
    plays = test_plays
  end
  local outcome = "initial"
  if external_outcome ~= "" then
    outcome = external_outcome
  else
    -- There is no external outcome, check the play for an outcome
    if current_play ~= nil then
      current_play:AddTime()
      outcome = current_play:ShouldTerminate(active_tactic_completed,
                                             predicates)
    end
  end

  if outcome then
    -- This may be used for metrics about the plays,
    -- for example to inform adjustments to the initial play weights
    log("Terminating current play: ",
        tostring(current_play),
        " Outcome: ",
        tostring(outcome))
    -- Run weighted experts on the applicable plays from last time
    -- see https://www.aaai.org/Papers/ICAPS/2004/ICAPS04-044.pdf
    local total_pseudo_weight = 0
    local pseudo_weights = {}
    log("applicable play: ");
    for i = 1, #applicable_plays do

      pseudo_weights[i] = applicable_plays[i].weight
                        * outcome_multipliers[outcome]
                        ^ (total_weight / applicable_plays[i].weight)
      total_pseudo_weight = total_pseudo_weight + pseudo_weights[i]
    end
    local N_t = total_weight / total_pseudo_weight
    for i = 1, #applicable_plays do
--       log(applicable_plays[i]:ToString());
      applicable_plays[i].weight = pseudo_weights[i] * N_t
    end
    -- Choose a new play from the applicable plays
    applicable_plays = {}
    total_weight = 0
    for i = 1, #plays do
      if plays[i]:IsApplicable(predicates) then
        table.insert(applicable_plays, plays[i])
        total_weight = total_weight + plays[i].weight
      end
    end
    local weight_choice = math.random()*total_weight
    for i = 1, #applicable_plays do
      local weight = applicable_plays[i].weight
      log(tostring(applicable_plays[i].name))
      if tostring(applicable_plays[i]) == tostring(current_play) then
        -- This is a hack, this is not correct hysteresis or stp behavior
        weight = weight + weight_choice
        log("HELP, had to add weight choice! (Check play_engine.lua)")
      end
      log(weight)
      if weight >= weight_choice then
        current_play = applicable_plays[i]
        return current_play:Start()
      else
        weight_choice = weight_choice - applicable_plays[i].weight
      end
    end
  elseif active_tactic_completed then
    -- Move on to the next set of tactics for each role
    return current_play:Advance()
  end
  -- Otherwise, we are continuing to use the same play and tactics,
  -- so we return nothing
end

return execute_play_engine, set_predicate
