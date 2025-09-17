import { defineBackend } from '@aws-amplify/backend';
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 50;
import { auth } from './auth/resource';
import { data } from './data/resource';
import { content, billing } from './storage/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
defineBackend({
  auth,
  data,
  content,
  billing
});
