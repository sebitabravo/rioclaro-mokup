// Dependency Injection Container
import { StationRepository } from '@domain/repositories/StationRepository';
import { UserRepository } from '@domain/repositories/UserRepository';
import { MeasurementRepository } from '@domain/repositories/MeasurementRepository';
import { AlertRepository, VariableModuleRepository } from '@domain/repositories/AlertRepository';
import { ReportRepository } from '@domain/repositories/ReportRepository';

// Use Cases
import { GetStationsUseCase, GetStationByIdUseCase } from '@application/use-cases/GetStations';
import { GetLatestMeasurementsUseCase, GetHistoricalMeasurementsUseCase } from '@application/use-cases/GetMeasurements';
import { GetUsersUseCase, CreateUserUseCase, UpdateUserUseCase, DeleteUserUseCase } from '@application/use-cases/ManageUsers';
import { GenerateDailyAverageReportUseCase, GenerateCriticalEventsReportUseCase, ExportReportUseCase } from '@application/use-cases/GenerateReports';

// Mock Implementations
import { MockStationRepository } from '../adapters/MockStationRepository';
import { MockUserRepository } from '../adapters/MockUserRepository';
import { MockMeasurementRepository } from '../adapters/MockMeasurementRepository';
import { MockAlertRepository, MockVariableModuleRepository } from '../adapters/MockAlertRepository';
import { MockReportRepository } from '../adapters/MockReportRepository';

export class DIContainer {
  private static instance: DIContainer;
  
  // Repositories
  private _stationRepository!: StationRepository;
  private _userRepository!: UserRepository;
  private _measurementRepository!: MeasurementRepository;
  private _alertRepository!: AlertRepository;
  private _variableModuleRepository!: VariableModuleRepository;
  private _reportRepository!: ReportRepository;
  
  // Use Cases
  private _getStationsUseCase!: GetStationsUseCase;
  private _getStationByIdUseCase!: GetStationByIdUseCase;
  private _getLatestMeasurementsUseCase!: GetLatestMeasurementsUseCase;
  private _getHistoricalMeasurementsUseCase!: GetHistoricalMeasurementsUseCase;
  private _getUsersUseCase!: GetUsersUseCase;
  private _createUserUseCase!: CreateUserUseCase;
  private _updateUserUseCase!: UpdateUserUseCase;
  private _deleteUserUseCase!: DeleteUserUseCase;
  private _generateDailyAverageReportUseCase!: GenerateDailyAverageReportUseCase;
  private _generateCriticalEventsReportUseCase!: GenerateCriticalEventsReportUseCase;
  private _exportReportUseCase!: ExportReportUseCase;

  private constructor() {
    this.initializeRepositories();
    this.initializeUseCases();
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  private initializeRepositories(): void {
    // Aquí puedes cambiar entre implementaciones Mock y API
    this._stationRepository = new MockStationRepository();
    this._userRepository = new MockUserRepository();
    this._measurementRepository = new MockMeasurementRepository();
    this._alertRepository = new MockAlertRepository();
    this._variableModuleRepository = new MockVariableModuleRepository();
    this._reportRepository = new MockReportRepository();
  }

  private initializeUseCases(): void {
    this._getStationsUseCase = new GetStationsUseCase(this._stationRepository);
    this._getStationByIdUseCase = new GetStationByIdUseCase(this._stationRepository);
    this._getLatestMeasurementsUseCase = new GetLatestMeasurementsUseCase(this._measurementRepository);
    this._getHistoricalMeasurementsUseCase = new GetHistoricalMeasurementsUseCase(this._measurementRepository);
    this._getUsersUseCase = new GetUsersUseCase(this._userRepository);
    this._createUserUseCase = new CreateUserUseCase(this._userRepository);
    this._updateUserUseCase = new UpdateUserUseCase(this._userRepository);
    this._deleteUserUseCase = new DeleteUserUseCase(this._userRepository);
    this._generateDailyAverageReportUseCase = new GenerateDailyAverageReportUseCase(this._reportRepository);
    this._generateCriticalEventsReportUseCase = new GenerateCriticalEventsReportUseCase(this._reportRepository);
    this._exportReportUseCase = new ExportReportUseCase(this._reportRepository);
  }

  // Getters para Use Cases
  get getStationsUseCase(): GetStationsUseCase { return this._getStationsUseCase; }
  get getStationByIdUseCase(): GetStationByIdUseCase { return this._getStationByIdUseCase; }
  get getLatestMeasurementsUseCase(): GetLatestMeasurementsUseCase { return this._getLatestMeasurementsUseCase; }
  get getHistoricalMeasurementsUseCase(): GetHistoricalMeasurementsUseCase { return this._getHistoricalMeasurementsUseCase; }
  get getUsersUseCase(): GetUsersUseCase { return this._getUsersUseCase; }
  get createUserUseCase(): CreateUserUseCase { return this._createUserUseCase; }
  get updateUserUseCase(): UpdateUserUseCase { return this._updateUserUseCase; }
  get deleteUserUseCase(): DeleteUserUseCase { return this._deleteUserUseCase; }
  get generateDailyAverageReportUseCase(): GenerateDailyAverageReportUseCase { return this._generateDailyAverageReportUseCase; }
  get generateCriticalEventsReportUseCase(): GenerateCriticalEventsReportUseCase { return this._generateCriticalEventsReportUseCase; }
  get exportReportUseCase(): ExportReportUseCase { return this._exportReportUseCase; }

  // Getters para Repositories (por si necesitas acceso directo)
  get stationRepository(): StationRepository { return this._stationRepository; }
  get userRepository(): UserRepository { return this._userRepository; }
  get measurementRepository(): MeasurementRepository { return this._measurementRepository; }
  get alertRepository(): AlertRepository { return this._alertRepository; }
  get variableModuleRepository(): VariableModuleRepository { return this._variableModuleRepository; }
  get reportRepository(): ReportRepository { return this._reportRepository; }
}