/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { post, get } from '../../../services/request';

import {
  login as loginAction,
  logout as logoutAction,
  network as networkAction,
  register as registerAction,
  enroll as enrollAction,
  error as errorAction
} from './actions';

import actions from '../charts/actions';

import Auth from '../../Auth';

const login = ({ user, password }, network) => dispatch =>
  post('/auth/login', { user, password, network })
    .then(resp => {
      Auth.authenticateUser(resp.token);
      dispatch(errorAction(null));
      dispatch(loginAction({ user, ...resp }));
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error(error);
      dispatch(errorAction(error));
    });

const logout = () => dispatch =>
  post('/auth/logout', {})
    .then(() => {
      Auth.deauthenticateUser();
      dispatch(logoutAction());
    })
    .catch(error => {
      // TODO: keeping till api service implemented
      // eslint-disable-next-line no-console
      console.error(error);
      dispatch(logoutAction());
    });

const network = () => dispatch =>
  get('/auth/networklist', {})
    .then(({ networkList }) => {
      const networks = networkList.map(network => network[0]);
      dispatch(networkAction({ networks }));
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error(error);
      dispatch(actions.getErroMessage(error));
    });

const register = user => dispatch =>
  post('/auth/register', { ...user })
    .then(resp => {
      dispatch(registerAction({ ...user, ...resp }));
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error(error);
      dispatch(errorAction(error));
    });

const enroll = user => dispatch =>
  post('/auth/enroll', { ...user })
    .then(resp => {
      dispatch(enrollAction({ ...user, ...resp }));
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error(error);
      dispatch(errorAction(error));
    });

export default {
  login,
  logout,
  network,
  register,
  enroll
};