import Task from '../../models/task';
import Taskmaster from '../../models/taskmaster';
import Type from '../../models/type';

export const SET_TASKS = 'SET_TASKS';

export const fetchTasks = () => {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(
        'https://back-mern-nextem.herokuapp.com/api/tasks/init',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + getState().auth.token
          }
        }
      );

      let resData = await response.json();
      const loadedTasks = [];
      const loadedTaskmasters = [];
      const loadedTypes = [];
      
      const resDataTasks = resData["tasks"];
      const resDataTaskmasters = resData["taskmasters"];
      const resDataTypes = resData["types"];

      for (const key in resDataTasks) {
        loadedTasks.push(
          new Task(
            resDataTasks[key]._id,
            resDataTasks[key].description,
            resDataTasks[key].taskmaster,
            resDataTasks[key].type,
            resDataTasks[key].deadline
          )
        );
      }

      for (const key in resDataTaskmasters) {
        loadedTaskmasters.push(
          new Taskmaster(
            resDataTaskmasters[key]._id,
            resDataTaskmasters[key].name
          )
        );
      }

      for (const key in resDataTypes) {
        loadedTypes.push(
          new Type(
            resDataTypes[key]._id,
            resDataTypes[key].name
          )
        );
      }

      dispatch({
        type: SET_TASKS,
        tasks: loadedTasks,
        taskmasters: loadedTaskmasters,
        types: loadedTypes
      });
    } catch (err) {
      // send to custom analytics server
      throw err;
    }
  };
};

export const createTask = (description, taskmaster, type, deadline) => {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(
        'https://back-mern-nextem.herokuapp.com/api/tasks',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + getState().auth.token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description,
            taskmaster,
            type,
            deadline
          })
        }
      );
      
      const resData = await response.json();
    } catch (err) {
      throw err;
    }
  };
};