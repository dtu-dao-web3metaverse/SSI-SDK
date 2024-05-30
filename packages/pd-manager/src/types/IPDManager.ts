import { IAgentContext, IPluginMethodMap } from '@veramo/core'
import { FindDefinitionArgs, PersistablePresentationDefinitionItem, PresentationDefinitionItem } from '@sphereon/ssi-sdk.data-store'

export interface IPDManager extends IPluginMethodMap {
  /**
   * Get a single presentation definition records by primary key
   * @param args
   */
  pdmGetDefinition(args: GetDefinitionItemArgs): Promise<PresentationDefinitionItem>

  /**
   * Find one or more presentation definition records using filters
   * @param args
   */
  pdmGetDefinitions(args: GetDefinitionItemsArgs): Promise<Array<PresentationDefinitionItem>>

  /**
   * Checks whether a presentation definition record exists by primary key
   * @param args
   */
  pdmHasDefinition(args: HasDefinitionItemArgs): Promise<boolean>

  /**
   * Checks whether one or more presentation definition records exist using filters
   * @param args
   */
  pdmHasDefinitions(args: HasDefinitionItemsArgs): Promise<boolean>

  /**
   * Delete a single presentation definition records by primary key
   * @param args
   */
  pdmDeleteDefinition(args: DeleteDefinitionItemArgs): Promise<boolean>

  /**
   * Delete multiple presentation definitions records using filters
   * @param args
   */
  pdmDeleteDefinitions(args: DeleteDefinitionItemsArgs): Promise<number>

  /**
   * Check in a presentation definition.
   * It has version control logic which will add or update presentation definition records and has settings for automatic version numbering.
   * @param args
   */
  pdmPersistDefinition(args: PersistDefinitionArgs): Promise<PresentationDefinitionItem>
}

export type VersionControlMode = 'AutoIncrementMajor' | 'AutoIncrementMinor' | 'Manual' | 'Overwrite' | 'OverwriteLatest'

export type GetDefinitionItemArgs = {
  itemId: string
}

export type HasDefinitionItemArgs = GetDefinitionItemArgs

export type GetDefinitionItemsArgs = {
  filter?: FindDefinitionArgs
}

export type HasDefinitionItemsArgs = GetDefinitionItemsArgs

export type DeleteDefinitionItemArgs = {
  itemId: string
}

export type DeleteDefinitionItemsArgs = GetDefinitionItemsArgs

export type PersistOptions = {
  versionControlMode?: VersionControlMode
}

export type PersistDefinitionArgs = {
  definitionItem: PersistablePresentationDefinitionItem
  opts?: PersistOptions
}

export type RequiredContext = IAgentContext<never>
