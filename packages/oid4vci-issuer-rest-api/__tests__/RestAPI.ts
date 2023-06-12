import { CredentialDataSupplierResult } from '@sphereon/oid4vci-issuer'
import { TAgent } from '@veramo/core'
import { IOID4VCIRestAPIOpts, IPlugins, OID4VCIRestAPI } from '../src'
import agent from './agent'

export const opts: IOID4VCIRestAPIOpts = {
  serverOpts: {
    host: '0.0.0.0',
    port: 5000,
  },
}

const credentialDataSupplier = () =>
  Promise.resolve({
    format: 'jwt_vc_json',
    credential: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'DBCConferenceAttendee'],
      credentialSubject: {
        firstName: 'Hello',
        lastName: 'DBC',
        email: 'example@sphereon.com', // based on user form input,
        event: {
          name: 'DBC Conference 2023',
          date: '2023-06-26',
        },
      },
    },
  } as unknown as CredentialDataSupplierResult)

export function start() {
  OID4VCIRestAPI.init({
    context: { ...agent.context, agent: agent as TAgent<IPlugins> },
    credentialDataSupplier,
    opts,
    issuerInstanceArgs: { credentialIssuer: 'https://oid4vci.ngrok.dev/test' },
  }).then((restApi) => {
    console.log('REST API STARTED: ' + restApi.instance.metadataOptions.credentialIssuer)
  })

  OID4VCIRestAPI.init({
    context: { ...agent.context, agent: agent as TAgent<IPlugins> },
    credentialDataSupplier,
    opts,
    issuerInstanceArgs: { credentialIssuer: 'https://oid4vci.ngrok.dev/dbc2023' },
  }).then((restApi) => {
    console.log('REST API STARTED: ' + restApi.instance.metadataOptions.credentialIssuer)
  })
}