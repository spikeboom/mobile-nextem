import {
  SET_TASKS
} from '../actions/tasks';

const initialState = {
  tasks: [],
  taskmasters: [],
  types: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_TASKS:
      return {
        tasks: action.tasks,
        taskmasters: action.taskmasters,
        types: action.types
      };
  }
  return state;
};
