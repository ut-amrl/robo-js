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

-- This is a simple class system that has no handling for inheritance
-- See play.lua for intended usage (e.g. how to define methods)

-- constructor: function; is expected to have the arguments (self, ...)
local function Class(constructor)
  local class = {}

  -- Instances of this class look up their methods from the class
  local instance_mt = {
    __index = class,
    __tostring = function(instance)
        return instance:ToString()
      end,
  }

  -- the metatable will set up instance-class interactions
  local class_mt = {
    -- causes the constructor to be called when using this table as a function
    __call = function(_, ...)
      local instance = {}
      -- attach to the class via its metatable
      setmetatable(instance, instance_mt)
      constructor(instance, ...)
      return instance
    end
  }

  setmetatable(class, class_mt)

  return class
end

return Class