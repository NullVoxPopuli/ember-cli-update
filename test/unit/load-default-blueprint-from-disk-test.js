'use strict';

const { describe, it } = require('../helpers/mocha');
const { expect } = require('../helpers/chai');
const path = require('path');
const sinon = require('sinon');
const utils = require('../../src/utils');
const loadDefaultBlueprintFromDisk = require('../../src/load-default-blueprint-from-disk');

describe(loadDefaultBlueprintFromDisk, function() {
  let require;
  let getVersions;

  beforeEach(function() {
    require = sinon.stub(utils, 'require');
    getVersions = sinon.stub(utils, 'getVersions');
  });

  afterEach(function() {
    sinon.restore();
  });

  it('handles missing package.json', async function() {
    require = require.withArgs(path.normalize('/test/path/package')).throws();

    let blueprint = await loadDefaultBlueprintFromDisk('/test/path', '0.0.1');

    expect(require).to.be.calledOnce;
    expect(getVersions).to.not.be.called;

    expect(blueprint).to.deep.equal({
      packageName: 'ember-cli',
      name: 'app',
      version: '0.0.1',
      codemodsSource: 'ember-app-codemods-manifest@1',
      isBaseBlueprint: true,
      options: ['--no-welcome']
    });
  });

  it('handles glimmer app', async function() {
    require = require.withArgs(path.normalize('/test/path/package')).returns({
      devDependencies: {
        '@glimmer/blueprint': '',
        'ember-cli': '0.0.1'
      }
    });

    let blueprint = await loadDefaultBlueprintFromDisk('/test/path', '0.0.2');

    expect(require).to.be.calledOnce;
    expect(getVersions).to.not.be.called;

    expect(blueprint).to.deep.equal({
      packageName: '@glimmer/blueprint',
      name: '@glimmer/blueprint',
      version: '0.0.2',
      isBaseBlueprint: true,
      options: []
    });
  });

  it('works', async function() {
    require = require.withArgs(path.normalize('/test/path/package')).returns({
      devDependencies: {
        'ember-cli': '0.0.1'
      }
    });

    getVersions = getVersions.withArgs('ember-cli').resolves(['0.0.1']);

    let blueprint = await loadDefaultBlueprintFromDisk('/test/path');

    expect(require).to.be.calledOnce;
    expect(getVersions).to.be.calledOnce;

    expect(blueprint).to.deep.equal({
      packageName: 'ember-cli',
      name: 'app',
      version: '0.0.1',
      codemodsSource: 'ember-app-codemods-manifest@1',
      isBaseBlueprint: true,
      options: ['--no-welcome']
    });
  });
});