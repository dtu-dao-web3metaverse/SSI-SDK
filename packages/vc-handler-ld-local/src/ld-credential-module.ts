import {
  CredentialPayload,
  IAgentContext,
  IKey,
  IKeyManager,
  IResolver,
  PresentationPayload,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core'
import Debug from 'debug'
import { extendContextLoader, purposes } from '@digitalcredentials/jsonld-signatures'
import * as vc from '@digitalcredentials/vc'
import { CredentialIssuancePurpose } from '@digitalcredentials/vc'
import { LdContextLoader } from './ld-context-loader'
import { LdSuiteLoader } from './ld-suite-loader'
import { VerifiableCredentialSP, VerifiablePresentationSP } from '@sphereon/ssi-sdk-core'
import { LdDocumentLoader } from './ld-document-loader'

export type RequiredAgentMethods = IResolver & Pick<IKeyManager, 'keyManagerGet' | 'keyManagerSign'>

const ProofPurpose = purposes.ProofPurpose
const AssertionProofPurpose = purposes.AssertionProofPurpose
const AuthenticationProofPurpose = purposes.AuthenticationProofPurpose

const debug = Debug('veramo:w3c:ld-credential-module-local')

export class LdCredentialModule {
  /**
   * TODO: General Implementation Notes
   * - (SOLVED) EcdsaSecp256k1Signature2019 (Signature) and EcdsaSecp256k1VerificationKey2019 (Key)
   * are not useable right now, since they are not able to work with blockChainId and ECRecover.
   * - DID Fragment Resolution.
   * - Key Manager and Verification Methods: Veramo currently implements no link between those.
   */

  ldSuiteLoader: LdSuiteLoader
  private ldDocumentLoader: LdDocumentLoader

  constructor(options: { ldContextLoader: LdContextLoader; ldSuiteLoader: LdSuiteLoader }) {
    this.ldSuiteLoader = options.ldSuiteLoader
    this.ldDocumentLoader = new LdDocumentLoader(options)
  }

  async issueLDVerifiableCredential(
    credential: CredentialPayload,
    issuerDid: string,
    key: IKey,
    verificationMethodId: string,
    purpose: typeof ProofPurpose = new CredentialIssuancePurpose(),
    context: IAgentContext<RequiredAgentMethods>
  ): Promise<VerifiableCredentialSP> {
    // fixme: We need to look at the verificationMethod in meta of the key, and then look up the suiteloader, as for instance ed25519 can be the 2018 or 2020 version
    const suite = this.ldSuiteLoader.getSignatureSuiteForKeyType(key.type, key.meta?.verificationMethod?.type)
    const documentLoader = this.ldDocumentLoader.getLoader(context, true)

    // some suites can modify the incoming credential (e.g. add required contexts)W
    suite.preSigningCredModification(credential)

    return await vc.issue({
      credential,
      purpose,
      suite: await suite.getSuiteForSigning(key, issuerDid, verificationMethodId, context),
      documentLoader,
      compactProof: false,
    })
  }

  async signLDVerifiablePresentation(
    presentation: PresentationPayload,
    holderDid: string,
    key: IKey,
    verificationMethodId: string,
    challenge: string | undefined,
    domain: string | undefined,
    purpose: typeof ProofPurpose = !challenge && !domain
      ? new AssertionProofPurpose()
      : new AuthenticationProofPurpose({
          domain,
          challenge,
        }),
    context: IAgentContext<RequiredAgentMethods>
  ): Promise<VerifiablePresentationSP> {
    const suite = this.ldSuiteLoader.getSignatureSuiteForKeyType(key.type, key.meta?.verificationMethod?.type)
    const documentLoader = this.ldDocumentLoader.getLoader(context, true)

    suite.preSigningPresModification(presentation)

    return await vc.signPresentation({
      presentation,
      suite: suite.getSuiteForSigning(key, holderDid, verificationMethodId, context),
      challenge,
      domain,
      documentLoader,
      purpose,
      compactProof: false,
    })
  }

  async verifyCredential(
    credential: VerifiableCredential,
    context: IAgentContext<IResolver>,
    fetchRemoteContexts: boolean = false,
    purpose: typeof ProofPurpose = new AssertionProofPurpose(),
    checkStatus?: Function
  ): Promise<boolean> {
    const verificationSuites = this.getAllVerificationSuites()
    this.ldSuiteLoader.getAllSignatureSuites().forEach((suite) => suite.preVerificationCredModification(credential))
    const result = await vc.verifyCredential({
      credential,
      suite: verificationSuites,
      documentLoader: this.ldDocumentLoader.getLoader(context, fetchRemoteContexts),
      purpose: purpose,
      compactProof: false,
      checkStatus: checkStatus,
    })

    if (result.verified) return true

    // NOT verified.

    // result can include raw Error
    debug(`Error verifying LD Verifiable Credential: ${JSON.stringify(result, null, 2)}`)
    console.log(JSON.stringify(result, null, 2))
    throw Error('Error verifying LD Verifiable Credential')
  }

  private getAllVerificationSuites() {
    return this.ldSuiteLoader.getAllSignatureSuites().map((x) => x.getSuiteForVerification())
  }

  async verifyPresentation(
    presentation: VerifiablePresentation,
    challenge: string | undefined,
    domain: string | undefined,
    context: IAgentContext<IResolver>,
    fetchRemoteContexts: boolean = false,
    presentationPurpose: typeof ProofPurpose = !challenge && !domain
      ? new AssertionProofPurpose()
      : new AuthenticationProofPurpose(domain, challenge),
    checkStatus?: Function
    //AssertionProofPurpose()
  ): Promise<boolean> {
    // console.log(JSON.stringify(presentation, null, 2))

    const result = await vc.verify({
      presentation,
      suite: this.getAllVerificationSuites(),
      documentLoader: this.ldDocumentLoader.getLoader(context, fetchRemoteContexts),
      challenge,
      domain,
      presentationPurpose,
      compactProof: false,
      checkStatus,
    })

    if (result.verified) return true

    // NOT verified.

    // result can include raw Error
    console.log(`Error verifying LD Verifiable Presentation`)
    console.log(JSON.stringify(result, null, 2))
    throw Error('Error verifying LD Verifiable Presentation')
  }
}
