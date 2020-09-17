import Application from 'ember-dwt/app';
import config from 'ember-dwt/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

setApplication(Application.create(config.APP));

start();
