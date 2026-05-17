import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { getInitialState, users } from '../mock/data';

const AppContext = createContext(null);

function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload };
    case 'LOGOUT':
      return { ...state, currentUser: null };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.data } : c
        ),
      };
    case 'SET_APPOINTMENTS':
      return { ...state, appointments: action.payload };
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] };
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload.data } : a
        ),
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const initial = useMemo(() => {
    const data = getInitialState();
    return { ...data, currentUser: null };
  }, []);

  const [state, dispatch] = useReducer(appReducer, initial);

  const login = (loginVal, password) => {
    const user = users.find((u) => u.login === loginVal && u.password === password);
    if (!user) return false;
    dispatch({ type: 'LOGIN', payload: user });
    return true;
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  const updateClient = (id, data) => dispatch({ type: 'UPDATE_CLIENT', payload: { id, data } });

  const updateAppointment = (id, data) =>
    dispatch({ type: 'UPDATE_APPOINTMENT', payload: { id, data } });

  const addAppointment = (appointment) =>
    dispatch({ type: 'ADD_APPOINTMENT', payload: appointment });

  const cancelAppointment = (id) =>
    updateAppointment(id, { status: 'cancelled' });

  const acceptTransfer = (id) => {
    const apt = state.appointments.find((a) => a.id === id);
    if (!apt) return;
    updateAppointment(id, {
      status: 'active',
      date: apt.proposedTransferDate || apt.date,
      timeStart: apt.proposedTransferStart,
      timeEnd: apt.proposedTransferEnd,
      proposedTransferDate: null,
      proposedTransferStart: null,
      proposedTransferEnd: null,
    });
  };

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      updateClient,
      updateAppointment,
      addAppointment,
      cancelAppointment,
      acceptTransfer,
    }),
    [state]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp вне AppProvider');
  return ctx;
}
