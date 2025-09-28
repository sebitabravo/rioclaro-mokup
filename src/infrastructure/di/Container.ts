// Dependency Injection Container
import { StationRepository } from '@domain/repositories/StationRepository';
import { UserRepository } from '@domain/repositories/UserRepository';
import { MeasurementRepository } from '@domain/repositories/MeasurementRepository';
import { AlertRepository, VariableModuleRepository } from '@domain/repositories/AlertRepository';
import { ReportRepository } from '@domain/repositories/ReportRepository';
import { AuthRepository } from '@domain/repositories/AuthRepository';

// Use Cases
import { GetStationsUseCase, GetStationByIdUseCase } from '@application/use-cases/GetStations';
import { CreateStationUseCase } from '@application/use-cases/CreateStationUseCase';
import { UpdateStationUseCase } from '@application/use-cases/UpdateStationUseCase';
import { DeleteStationUseCase } from '@application/use-cases/DeleteStationUseCase';
import { GetStationsPaginatedUseCase } from '@application/use-cases/GetStationsPaginatedUseCase';
import { GetLatestMeasurementsUseCase, GetHistoricalMeasurementsUseCase } from '@application/use-cases/GetMeasurements';
import { GetUsersUseCase, CreateUserUseCase, UpdateUserUseCase, DeleteUserUseCase } from '@application/use-cases/ManageUsers';
import { GenerateDailyAverageReportUseCase, GenerateCriticalEventsReportUseCase, ExportReportUseCase } from '@application/use-cases/GenerateReports';
import { LoginUseCase, RegisterUseCase, LogoutUseCase, ValidateTokenUseCase, RefreshTokenUseCase } from '@application/use-cases/AuthUseCases';

// API Implementations
import { ApiStationRepository } from '../adapters/ApiStationRepository';
import { ApiUserRepository } from '../adapters/ApiUserRepository';
import { ApiMeasurementRepository } from '../adapters/ApiMeasurementRepository';
import { ApiAlertRepository, ApiVariableModuleRepository } from '../adapters/ApiAlertRepository';
import { ApiReportRepository } from '../adapters/ApiReportRepository';
import { ApiAuthRepository } from '../adapters/ApiAuthRepository';
import { apiClient } from '../adapters/ApiClient';

// Mock Implementations (for fallback/development)
import { MockStationRepository } from '../adapters/MockStationRepository';
import { MockUserRepository } from '../adapters/MockUserRepository';
import { MockMeasurementRepository } from '../adapters/MockMeasurementRepository';
import { MockAlertRepository, MockVariableModuleRepository } from '../adapters/MockAlertRepository';
import { MockReportRepository } from '../adapters/MockReportRepository';
import { MockAuthRepository } from '../adapters/MockAuthRepository';

export class DIContainer {
  private static instance: DIContainer;
  
  // Repositories
  private _stationRepository!: StationRepository;
  private _userRepository!: UserRepository;
  private _measurementRepository!: MeasurementRepository;
  private _alertRepository!: AlertRepository;
  private _variableModuleRepository!: VariableModuleRepository;
  private _reportRepository!: ReportRepository;
  private _authRepository!: AuthRepository;
  
  // Use Cases
  private _getStationsUseCase!: GetStationsUseCase;
  private _getStationByIdUseCase!: GetStationByIdUseCase;
  private _createStationUseCase!: CreateStationUseCase;
  private _updateStationUseCase!: UpdateStationUseCase;
  private _deleteStationUseCase!: DeleteStationUseCase;
  private _getStationsPaginatedUseCase!: GetStationsPaginatedUseCase;
  private _getLatestMeasurementsUseCase!: GetLatestMeasurementsUseCase;
  private _getHistoricalMeasurementsUseCase!: GetHistoricalMeasurementsUseCase;
  private _getUsersUseCase!: GetUsersUseCase;
  private _createUserUseCase!: CreateUserUseCase;
  private _updateUserUseCase!: UpdateUserUseCase;
  private _deleteUserUseCase!: DeleteUserUseCase;
  private _generateDailyAverageReportUseCase!: GenerateDailyAverageReportUseCase;
  private _generateCriticalEventsReportUseCase!: GenerateCriticalEventsReportUseCase;
  private _exportReportUseCase!: ExportReportUseCase;
  private _loginUseCase!: LoginUseCase;
  private _registerUseCase!: RegisterUseCase;
  private _logoutUseCase!: LogoutUseCase;
  private _validateTokenUseCase!: ValidateTokenUseCase;
  private _refreshTokenUseCase!: RefreshTokenUseCase;

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
    // Variables de entorno para determinar qué implementación usar
    const useApiImplementation = (import.meta as { env?: Record<string, string> }).env?.VITE_USE_API !== 'false';

    if (useApiImplementation) {
      // Usar implementaciones API reales
      this._stationRepository = new ApiStationRepository(apiClient);
      this._userRepository = new ApiUserRepository(apiClient);
      this._measurementRepository = new ApiMeasurementRepository(apiClient);
      this._alertRepository = new ApiAlertRepository(apiClient);
      this._variableModuleRepository = new ApiVariableModuleRepository(apiClient);
      this._reportRepository = new ApiReportRepository(apiClient);
      this._authRepository = new ApiAuthRepository(apiClient);
    } else {
      // Usar implementaciones Mock para desarrollo/testing
      this._stationRepository = new MockStationRepository();
      this._userRepository = new MockUserRepository();
      this._measurementRepository = new MockMeasurementRepository();
      this._alertRepository = new MockAlertRepository();
      this._variableModuleRepository = new MockVariableModuleRepository();
      this._reportRepository = new MockReportRepository();
      this._authRepository = new MockAuthRepository();
    }
  }

  private initializeUseCases(): void {
    this._getStationsUseCase = new GetStationsUseCase(this._stationRepository);
    this._getStationByIdUseCase = new GetStationByIdUseCase(this._stationRepository);
    this._createStationUseCase = new CreateStationUseCase(this._stationRepository);
    this._updateStationUseCase = new UpdateStationUseCase(this._stationRepository);
    this._deleteStationUseCase = new DeleteStationUseCase(this._stationRepository);
    this._getStationsPaginatedUseCase = new GetStationsPaginatedUseCase(this._stationRepository);
    this._getLatestMeasurementsUseCase = new GetLatestMeasurementsUseCase(this._measurementRepository);
    this._getHistoricalMeasurementsUseCase = new GetHistoricalMeasurementsUseCase(this._measurementRepository);
    this._getUsersUseCase = new GetUsersUseCase(this._userRepository);
    this._createUserUseCase = new CreateUserUseCase(this._userRepository);
    this._updateUserUseCase = new UpdateUserUseCase(this._userRepository);
    this._deleteUserUseCase = new DeleteUserUseCase(this._userRepository);
    this._generateDailyAverageReportUseCase = new GenerateDailyAverageReportUseCase(this._reportRepository);
    this._generateCriticalEventsReportUseCase = new GenerateCriticalEventsReportUseCase(this._reportRepository);
    this._exportReportUseCase = new ExportReportUseCase(this._reportRepository);
    this._loginUseCase = new LoginUseCase(this._authRepository);
    this._registerUseCase = new RegisterUseCase(this._authRepository);
    this._logoutUseCase = new LogoutUseCase(this._authRepository);
    this._validateTokenUseCase = new ValidateTokenUseCase(this._authRepository);
    this._refreshTokenUseCase = new RefreshTokenUseCase(this._authRepository);
  }

  // Getters para Use Cases
  get getStationsUseCase(): GetStationsUseCase { return this._getStationsUseCase; }
  get getStationByIdUseCase(): GetStationByIdUseCase { return this._getStationByIdUseCase; }
  get createStationUseCase(): CreateStationUseCase { return this._createStationUseCase; }
  get updateStationUseCase(): UpdateStationUseCase { return this._updateStationUseCase; }
  get deleteStationUseCase(): DeleteStationUseCase { return this._deleteStationUseCase; }
  get getStationsPaginatedUseCase(): GetStationsPaginatedUseCase { return this._getStationsPaginatedUseCase; }
  get getLatestMeasurementsUseCase(): GetLatestMeasurementsUseCase { return this._getLatestMeasurementsUseCase; }
  get getHistoricalMeasurementsUseCase(): GetHistoricalMeasurementsUseCase { return this._getHistoricalMeasurementsUseCase; }
  get getUsersUseCase(): GetUsersUseCase { return this._getUsersUseCase; }
  get createUserUseCase(): CreateUserUseCase { return this._createUserUseCase; }
  get updateUserUseCase(): UpdateUserUseCase { return this._updateUserUseCase; }
  get deleteUserUseCase(): DeleteUserUseCase { return this._deleteUserUseCase; }
  get generateDailyAverageReportUseCase(): GenerateDailyAverageReportUseCase { return this._generateDailyAverageReportUseCase; }
  get generateCriticalEventsReportUseCase(): GenerateCriticalEventsReportUseCase { return this._generateCriticalEventsReportUseCase; }
  get exportReportUseCase(): ExportReportUseCase { return this._exportReportUseCase; }
  get loginUseCase(): LoginUseCase { return this._loginUseCase; }
  get registerUseCase(): RegisterUseCase { return this._registerUseCase; }
  get logoutUseCase(): LogoutUseCase { return this._logoutUseCase; }
  get validateTokenUseCase(): ValidateTokenUseCase { return this._validateTokenUseCase; }
  get refreshTokenUseCase(): RefreshTokenUseCase { return this._refreshTokenUseCase; }

  // Getters para Repositories (por si necesitas acceso directo)
  get stationRepository(): StationRepository { return this._stationRepository; }
  get userRepository(): UserRepository { return this._userRepository; }
  get measurementRepository(): MeasurementRepository { return this._measurementRepository; }
  get alertRepository(): AlertRepository { return this._alertRepository; }
  get variableModuleRepository(): VariableModuleRepository { return this._variableModuleRepository; }
  get reportRepository(): ReportRepository { return this._reportRepository; }
  get authRepository(): AuthRepository { return this._authRepository; }
}

// Default export for singleton instance
export const Container = DIContainer.getInstance();

// Named export for class
// DIContainer is already exported as class declaration above