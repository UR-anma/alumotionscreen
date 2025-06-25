/// <reference lib="webworker" />
import {
    OperatorScreenBehaviors,
    OptionalPromise,
    registerOperatorScreenBehavior,
    ScriptBuilder
} from '@universal-robots/contribution-api';
import { AlumotionscreenModel } from './AlumotionScreenModel';

// factory is required
const createOperatorScreen = (): OptionalPromise<AlumotionscreenModel> => ({
    type: 'ur-alumotionscreen-alumotionscreen',    // type is required
    version: '0.0.4'     // version is required
});

// generatePreamble is optional
const generatePreambleScriptCode = (node: AlumotionscreenModel): OptionalPromise<ScriptBuilder> => {
    const builder = new ScriptBuilder();

    builder.addRaw('###################################################################################################')
    builder.addRaw('###################################################################################################')
    builder.addRaw('opScreenServer = rpc_factory("xmlrpc","http://servicegateway/ur/alumotionscreen/alumotionscreen-backend/xmlrpc/")')
    builder.addRaw('###################################################################################################')
    builder.addRaw('###################################################################################################')

    return builder;
};

const behaviors: OperatorScreenBehaviors = {
    factory: createOperatorScreen,
    generatePreamble: generatePreambleScriptCode,
};

registerOperatorScreenBehavior(behaviors);
