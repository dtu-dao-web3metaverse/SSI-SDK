import { DataSource } from 'typeorm'
import { MachineStateInfoEntity } from '../entities/machineState/MachineStateInfoEntity'

import { DataStoreMachineStateInfoEntities, DataStoreXStateStoreMigrations, StorePersistMachineArgs, MachineStateInfoStore } from '../index'

describe('Machine State Info Database entities tests', (): void => {
  let dbConnection: DataSource

  beforeEach(async (): Promise<void> => {
    dbConnection = await new DataSource({
      type: 'sqlite',
      database: ':memory:',
      //logging: 'all',
      migrationsRun: false,
      migrations: DataStoreXStateStoreMigrations,
      synchronize: false,
      entities: [...DataStoreMachineStateInfoEntities],
    }).initialize()
    await dbConnection.runMigrations()
    expect(await dbConnection.showMigrations()).toBeFalsy()
  })

  afterEach(async (): Promise<void> => {
    await dbConnection.destroy()
  })

  it('should save machine state info to database', async (): Promise<void> => {
    const expiresAt = new Date()
    expiresAt.setTime(expiresAt.getTime() + 100000)
    const machineInfo: StorePersistMachineArgs = {
      id: 'Onboarding1',
      latestStateName: 'acceptAgreement',
      machineId: 'Onboarding',
      latestEventType: 'SET_TOC',
      state: JSON.stringify({ myState: 'test_state' }),
      tenantId: 'test_tenant_id',
      expiresAt,
    }
    const fromDb: MachineStateInfoEntity = await dbConnection
      .getRepository(MachineStateInfoEntity)
      .save(MachineStateInfoStore.machineStateInfoEntityFrom(machineInfo))

    expect(fromDb).toBeDefined()
    expect(fromDb?.id).not.toBeNull()
    expect(fromDb?.machineId).toEqual(machineInfo.machineId)
    expect(JSON.parse(fromDb?.state)).toEqual(machineInfo.state)
    expect(fromDb?.tenantId).toEqual(machineInfo.tenantId)
    expect(fromDb?.completedAt).toBeNull()
  })
})
