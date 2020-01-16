-- Copyright 2017 rezecib@gmail.com
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

local Class = require("class")

-- Builds a play object from the play specification
-- self: table; instance of Play
-- spec: table; sparse table with play's preconditions, termination, etc
local Play = Class(function(self, spec)
  self.name = spec.name
  self.weight = spec.weight or 1
  self.timeout = (spec.timeout or 15) * 60
  self.time = 0
  self.applicability = spec.applicability
  self.termination = spec.termination
  self.roles = spec.roles
  self.step = 0
  self.total_steps = 0
  for i = 1, #self.roles do
    self.total_steps = math.max(self.total_steps, #self.roles[i])
  end
end)

function Play:AddTime()
  self.time = self.time + 1
end

-- Checks a clause in a DNF expression to determine if it is satisfied
-- predicates: table; stores boolean predicates by string keys
-- clause: table; stores a list of predicate strings
local function CheckDnfClause(predicates, clause)
  for i = 1, #clause do
    local predicate = clause[i]
    -- Handle negated predicates
    if predicate:sub(1,1) == "!" then
      predicate = not predicates[predicate:sub(2)]
    else
      predicate = predicates[predicate]
    end
    -- One predicate was false, terminate early
    if not predicate then return false end
  end
  -- If all predicates are true, the clause is satisfied
  return true
end

function Play:IsApplicable(predicates)
  for i = 1, #self.applicability do
    if CheckDnfClause(predicates, self.applicability[i]) then
      return true
    end
  end
  return false  -- not necessary, but makes this clearer
end

-- Determines if the play should terminate
-- active_tactic_completed: boolean; whether it completed
-- predicates: table; stores boolean predicates by string keys
-- return: string or boolean; the termination outcome or false
function Play:ShouldTerminate(active_tactic_completed, predicates)
  if active_tactic_completed and self.step == self.total_steps then
    return "completed"
  end
  if self.time >= self.timeout then return "timeout" end
  for i = 1, #self.termination do
    if CheckDnfClause(predicates, self.termination[i].condition) then
      return self.termination[i].outcome
    end
  end
  return false  -- not necessary, but makes this clearer
end

function Play:Start()
  self.step = 0
  self.time = 0
  return self:Advance()
end

function Play:Advance()
  self.step = self.step + 1
  -- This looks terrible but there should always be 5 roles,
  -- and it ensures that it gets handled all at once,
  -- with minimal overhead
  if #self.roles == 8 then
    return self.roles[1][self.step],
          self.roles[2][self.step],
          self.roles[3][self.step],
          self.roles[4][self.step],
          self.roles[5][self.step],
          self.roles[6][self.step],
          self.roles[7][self.step],
          self.roles[8][self.step]
  end
  return self.roles[1][self.step],
         self.roles[2][self.step],
         self.roles[3][self.step],
         self.roles[4][self.step],
         self.roles[5][self.step],
         self.roles[6][self.step]

end

function Play:ToString()
  return self.name
end

return Play