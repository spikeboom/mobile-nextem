import React, { useState, useEffect, useCallback, useReducer } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';

import Input from '../../components/UI/Input';
import HeaderButton from '../../components/UI/HeaderButton';
import * as tasksActions from '../../store/actions/tasks';
import Colors from '../../constants/Colors';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

const formReducer = (state, action) => {
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.input]: action.value
    };
    const updatedValidities = {
      ...state.inputValidities,
      [action.input]: action.isValid
    };
    let updatedFormIsValid = true;
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }
    return {
      formIsValid: updatedFormIsValid,
      inputValidities: updatedValidities,
      inputValues: updatedValues
    };
  }
  return state;
};

const TasksOverviewScreen = props => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState();
  const dispatch = useDispatch();

  const tasks = useSelector(state => state.tasks.tasks);
  const taskmasters = useSelector(state => state.tasks.taskmasters);
  const types = useSelector(state => state.tasks.types);

  const [formState, dispatchFormState] = useReducer(formReducer, {
    inputValues: {
      description: '',
      taskmaster: '',
      type: '',
      deadline: ''
    },
    inputValidities: {
      description: false,
      taskmaster: false,
      type: false,
      deadline: false
    },
    formIsValid: false
  });

  const submitHandler = useCallback(async () => {

    if (!formState.formIsValid) {
      Alert.alert('Dados inválidos!', 'Verifique os erros no formulário.', [
        { text: 'Okay' }
      ]);
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await dispatch(
        tasksActions.createTask(
          formState.inputValues.description,
          formState.inputValues.taskmaster,
          formState.inputValues.type,
          formState.inputValues.deadline
        )
      );
      loadTasks();
    } catch (err) {
      setError(err.message);
    }

    setIsLoading(false);
    
  }, [dispatch, formState]);

  useEffect(() => {
    props.navigation.setParams({ submit: submitHandler });
  }, [submitHandler]);

  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      dispatchFormState({
        type: FORM_INPUT_UPDATE,
        value: inputValue,
        isValid: inputValidity,
        input: inputIdentifier
      });
    },
    [dispatchFormState]
  );

  const loadTasks = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    try {
      await dispatch(tasksActions.fetchTasks());
    } catch (err) {
      setError(err.message);
    }
    setIsRefreshing(false);
  }, [dispatch, setIsLoading, setError]);

  useEffect(() => {
    const willFocusSub = props.navigation.addListener(
      'willFocus',
      loadTasks
    );

    return () => {
      willFocusSub.remove();
    };
  }, [loadTasks]);

  useEffect(() => {
    setIsLoading(true);
    loadTasks().then(() => {
      setIsLoading(false);
    });
  }, [dispatch, loadTasks]);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>An error occurred!</Text>
        <Text>{error}</Text>
        <Button
          title="Try again"
          onPress={loadTasks}
          color={Colors.primary}
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView>

      <Input
        id="description"
        label="Descrição"
        errorText="Digite uma descrição válida!"
        keyboardType="default"
        autoCapitalize="sentences"
        autoCorrect
        returnKeyType="next"
        onInputChange={inputChangeHandler}
        initialValue={''}
        initiallyValid={false}
        required
        minLength={5}
      />

      <Input
        id="taskmaster"
        label="Responsável"
        errorText="Escolha uma opção válida!"
        keyboardType="default"
        autoCapitalize="sentences"
        autoCorrect
        returnKeyType="next"
        onInputChange={inputChangeHandler}
        initialValue={''}
        initiallyValid={false}
        required
        dataInit={taskmasters}
        type={"picker"}
      />

      <Input
        id="type"
        label="Status"
        errorText="Escolha um status válido!"
        keyboardType="default"
        autoCapitalize="sentences"
        autoCorrect
        returnKeyType="next"
        onInputChange={inputChangeHandler}
        initialValue={''}
        initiallyValid={false}
        required
        dataInit={types}
        type={"picker"}
      />

      <Input
        id="deadline"
        label="Deadline"
        errorText="Escolha uma data válida!"
        keyboardType="default"
        autoCapitalize="sentences"
        autoCorrect
        returnKeyType="next"
        onInputChange={inputChangeHandler}
        initialValue={''}
        initiallyValid={false}
        required
        type={"datepicker"}
      />

      <FlatList
        onRefresh={loadTasks}
        refreshing={isRefreshing}
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={itemData => (
          <View style={styles.tasks}>
            <Text style={styles.description}>{itemData.item.description}</Text>
            <Text style={styles.taskmaster}>{itemData.item.taskmaster.name}</Text>
            <Text style={styles.type}>{itemData.item.type.name}</Text>
            <Text style={styles.deadline}>{itemData.item.deadline.slice(0,10)}</Text>
          </View>  
        )}
      />

    </ScrollView>
  );
};

TasksOverviewScreen.navigationOptions = navData => {
  const submitFn = navData.navigation.getParam('submit');
  return {
    headerTitle: 'Adicionar Tarefa',
    headerRight: (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Save"
          iconName={
            Platform.OS === 'android' ? 'md-checkmark' : 'ios-checkmark'
          }
          onPress={submitFn}
        />
      </HeaderButtons>
    )
  };
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  description: {
    fontSize: 20,
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: 'open-sans-bold'
  },
  taskmaster: {
    fontFamily: 'open-sans',
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 20
  },
  type: {
    fontFamily: 'open-sans',
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 20
  },
  deadline: {
    fontFamily: 'open-sans',
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 20
  },
  tasks: {
    marginVertical: 10,
    alignItems: 'center'
  }
});

export default TasksOverviewScreen;
