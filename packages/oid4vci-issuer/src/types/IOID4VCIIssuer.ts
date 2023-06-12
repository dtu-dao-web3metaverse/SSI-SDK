import { AccessTokenRequest, AccessTokenResponse } from '@sphereon/oid4vci-common'
import {
  CredentialIssuerMetadataOpts,
  CredentialOfferFormat,
  CredentialRequestV1_0_11,
  CredentialResponse,
  Grant,
  IssuerCredentialDefinition,
} from '@sphereon/oid4vci-common'
import { CredentialDataSupplier } from '@sphereon/oid4vci-issuer/lib/types'
import { IDIDOptions, ResolveOpts } from '@sphereon/ssi-sdk-ext.did-utils'
import { IOID4VCIStore } from '@sphereon/ssi-sdk.oid4vci-issuer-store'
import { ICredential } from '@sphereon/ssi-types/dist'
import {
  IAgentContext,
  ICredentialIssuer,
  ICredentialVerifier,
  IDataStoreORM,
  IDIDManager,
  IKeyManager,
  IPluginMethodMap,
  IResolver,
} from '@veramo/core'
import { IssuerInstance } from '../IssuerInstance'

export interface IOID4VCIIssuer extends IPluginMethodMap {
  oid4vciCreateOfferURI(createArgs: ICreateOfferArgs, context: IRequiredContext): Promise<string>
  oid4vciIssueCredential(issueArgs: IIssueCredentialArgs, context: IRequiredContext): Promise<CredentialResponse>
  oid4vciCreateAccessTokenResponse(accessTokenArgs: IAssertValidAccessTokenArgs, context: IRequiredContext): Promise<AccessTokenResponse>
  oid4vciGetInstance(args: IIssuerInstanceArgs, context: IRequiredContext): Promise<IssuerInstance>
}

export interface IOID4VCIIssuerOpts {
  defaultStoreId?: string
  defaultNamespace?: string
  resolveOpts?: ResolveOpts
}

export interface IIssuerDefaultOpts extends IIssuerOptions {}

export interface ICreateOfferArgs extends IIssuerInstanceArgs {
  grants?: Grant
  credentials?: (CredentialOfferFormat | string)[]
  credentialDefinition?: IssuerCredentialDefinition
  credentialOfferUri?: string
  baseUri?: string
  scheme?: string
  pinLength?: number
}

export interface IIssueCredentialArgs extends IIssuerInstanceArgs {
  credentialRequest: CredentialRequestV1_0_11
  credential?: ICredential
  credentialDataSupplier?: CredentialDataSupplier
  newCNonce?: string
  cNonceExpiresIn?: number
  tokenExpiresIn?: number
  responseCNonce?: string
}

export interface IAssertValidAccessTokenArgs extends IIssuerInstanceArgs {
  request: AccessTokenRequest
  expirationDuration: number
}

export interface IIssuerInstanceArgs {
  credentialIssuer: string
  storeId?: string
  namespace?: string
}

export interface IIssuerInstanceOptions extends IMetadataOptions {
  issuerOpts?: IIssuerOptions
  metadataOpts?: CredentialIssuerMetadataOpts
}

export interface IIssuerOptions {
  didOpts: IDIDOptions
  userPinRequired?: boolean
  cNonceExpiresIn?: number
}

export interface IMetadataOptions {
  credentialIssuer: string //The Credential Issuer's identifier.
  storeId?: string
  storeNamespace?: string
}

export type IRequiredContext = IAgentContext<
  IDataStoreORM & IResolver & IDIDManager & IKeyManager & ICredentialIssuer & ICredentialVerifier & IOID4VCIStore
>