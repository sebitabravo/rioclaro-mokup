import { useEffect, useState } from "react";
import { Navbar } from "@shared/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Users, MapPin, UserCheck, Plus, Edit, Trash2, AlertTriangle, X, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { useUserStore } from "@features/admin/stores/UserStore";
import { useStationStore } from "@features/admin/stores/StationStore";
import type { User } from "@domain/entities/User";
import type { Station } from "@domain/entities/Station";

export function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");
  const { users, loading: usersLoading, error: userError, fetchUsers, createUser, updateUser, deleteUser } = useUserStore();
  const { stations, loading: stationsLoading, error: stationError, fetchStations, createStation, updateStation, deleteStation } = useStationStore();
  
  // Form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [showStationForm, setShowStationForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null);
  
  // Form data states
  const [userFormData, setUserFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    role: 'Observador',
    is_staff: false,
    is_superuser: false
  });
  
  const [stationFormData, setStationFormData] = useState({
    name: '',
    code: '',
    location: '',
    latitude: '',
    longitude: '',
    threshold: ''
  });

  // Alert-related states
  const [modules, setModules] = useState([
    {
      id: 'water_level',
      name: 'Monitoreo de Nivel de Agua',
      description: 'Módulo principal del sistema (obligatorio)',
      active: true,
      required: true
    },
    {
      id: 'turbidity',
      name: 'Monitoreo de Turbidez',
      description: 'Medición de calidad del agua',
      active: false,
      required: false
    },
    {
      id: 'flow_rate',
      name: 'Monitoreo de Caudal',
      description: 'Medición de velocidad del agua',
      active: true,
      required: false
    },
    {
      id: 'ph_monitoring',
      name: 'Monitoreo de pH',
      description: 'Medición de acidez del agua',
      active: false,
      required: false
    },
    {
      id: 'temperature',
      name: 'Monitoreo de Temperatura',
      description: 'Medición de temperatura del agua',
      active: true,
      required: false
    }
  ]);

  // Mock data for active alerts
  const mockActiveAlerts = [
    {
      id: 1,
      station_id: 3,
      station_name: "Río Claro Sur",
      type: "critical" as const,
      message: "Nivel del agua superó el umbral crítico",
      level: 3.2,
      threshold: 3.0,
      status: "active" as const,
      created_at: "2025-01-13T09:45:00Z"
    },
    {
      id: 2,
      station_id: 1,
      station_name: "Río Claro Norte",
      type: "warning" as const,
      message: "Nivel del agua se aproxima al umbral",
      level: 2.8,
      threshold: 3.0,
      status: "active" as const,
      created_at: "2025-01-13T11:20:00Z"
    }
  ];

  useEffect(() => {
    fetchUsers();
    fetchStations();
  }, [fetchUsers, fetchStations]);

  // Reset forms when editing changes
  useEffect(() => {
    if (editingUser) {
      setUserFormData({
        first_name: editingUser.first_name || '',
        last_name: editingUser.last_name || '',
        email: editingUser.email,
        username: editingUser.username,
        role: editingUser.role,
        is_staff: editingUser.is_staff,
        is_superuser: editingUser.is_superuser
      });
    } else {
      setUserFormData({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        role: 'Observador',
        is_staff: false,
        is_superuser: false
      });
    }
  }, [editingUser]);

  useEffect(() => {
    if (editingStation) {
      setStationFormData({
        name: editingStation.name,
        code: editingStation.code,
        location: editingStation.location,
        latitude: editingStation.latitude.toString(),
        longitude: editingStation.longitude.toString(),
        threshold: editingStation.threshold.toString()
      });
    } else {
      setStationFormData({
        name: '',
        code: '',
        location: '',
        latitude: '',
        longitude: '',
        threshold: ''
      });
    }
  }, [editingStation]);

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = {
        ...userFormData,
        is_staff: userFormData.role === 'Técnico' || userFormData.role === 'Administrador',
        is_superuser: userFormData.role === 'Administrador'
      };
      
      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        // Para crear usuarios necesitamos incluir el password
        const createData = {
          ...userData,
          password: 'temp123' // Password temporal - debería ser reemplazado por un campo en el formulario
        };
        await createUser(createData);
      }
      
      setShowUserForm(false);
      setEditingUser(null);
      await fetchUsers();
    } catch {
      // Error ya manejado por el store
    }
  };

  const handleSubmitStation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stationData = {
        name: stationFormData.name,
        code: stationFormData.code,
        location: stationFormData.location,
        latitude: parseFloat(stationFormData.latitude),
        longitude: parseFloat(stationFormData.longitude),
        threshold: parseFloat(stationFormData.threshold),
        current_level: 0,
        status: 'active' as const,
        last_measurement: new Date().toISOString()
      };
      
      if (editingStation) {
        await updateStation(editingStation.id, stationData);
      } else {
        await createStation(stationData);
      }
      
      setShowStationForm(false);
      setEditingStation(null);
      await fetchStations();
    } catch {
      // Error ya manejado por el store
    }
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        setUserToDelete(null);
        await fetchUsers();
      } catch {
        // Error ya manejado por el store
      }
    }
  };

  const handleDeleteStation = async () => {
    if (stationToDelete) {
      try {
        await deleteStation(stationToDelete.id);
        setStationToDelete(null);
        await fetchStations();
      } catch {
        // Error ya manejado por el store
      }
    }
  };

  // Alert-related functions
  const toggleModule = (moduleId: string) => {
    if (moduleId === 'water_level') return; // Cannot disable main module
    
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, active: !module.active }
        : module
    ));
  };

  if (usersLoading || stationsLoading) {
    return (
      <div className="min-h-screen bg-gov-neutral">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gov-neutral">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gov-black">Administración</h1>
          <p className="text-lg text-gov-gray-a">
            Gestión de usuarios, estaciones y configuración del sistema
          </p>
        </div>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={activeTab === "users" ? "default" : "outline"}
              onClick={() => setActiveTab("users")}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Usuarios</span>
            </Button>
            
            <Button
              variant={activeTab === "stations" ? "default" : "outline"}
              onClick={() => setActiveTab("stations")}
              className="flex items-center space-x-2"
            >
              <MapPin className="h-4 w-4" />
              <span>Estaciones</span>
            </Button>
            
            <Button
              variant={activeTab === "assignments" ? "default" : "outline"}
              onClick={() => setActiveTab("assignments")}
              className="flex items-center space-x-2"
            >
              <UserCheck className="h-4 w-4" />
              <span>Asignaciones</span>
            </Button>
            
            <Button
              variant={activeTab === "alerts" ? "default" : "outline"}
              onClick={() => setActiveTab("alerts")}
              className="flex items-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Alertas</span>
            </Button>
            
            <Button
              variant={activeTab === "modules" ? "default" : "outline"}
              onClick={() => setActiveTab("modules")}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Módulos</span>
            </Button>
          </div>

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <Card className="bg-gov-white border-gov-accent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gov-black">Gestión de Usuarios</CardTitle>
                      <CardDescription className="text-gov-gray-a">
                        Administrar usuarios del sistema
                      </CardDescription>
                    </div>
                    <Button 
                      className="bg-gov-primary text-white hover:bg-gov-primary/90"
                      onClick={() => {
                        setEditingUser(null);
                        setShowUserForm(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Usuario
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 rounded-lg border border-gov-accent bg-gov-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-gov-primary text-white flex items-center justify-center">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gov-black">
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="text-sm text-gov-gray-a">{user.email}</p>
                              <p className="text-xs text-gov-gray-b">@{user.username}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className={`px-2 py-1 rounded text-xs font-medium ${
                                user.is_superuser ? 'bg-gov-secondary text-white' :
                                user.is_staff ? 'bg-gov-primary text-white' : 'bg-gov-gray-a text-white'
                              }`}>
                                {user.role}
                              </div>
                              <p className="text-xs text-gov-gray-b mt-1">
                                {user.assigned_stations.length} estaciones
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-transparent border-gov-primary text-gov-primary"
                                onClick={() => {
                                  setEditingUser(user);
                                  setShowUserForm(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-transparent border-gov-secondary text-gov-secondary"
                                onClick={() => setUserToDelete(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* User Form Modal */}
              {showUserForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <Card className="bg-gov-white border-gov-accent w-full max-w-md mx-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-gov-black">
                          {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setShowUserForm(false);
                            setEditingUser(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitUser} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gov-black">Nombre</label>
                            <Input 
                              value={userFormData.first_name}
                              onChange={(e) => setUserFormData(prev => ({ ...prev, first_name: e.target.value }))}
                              placeholder="Ingrese el nombre" 
                              className="mt-1" 
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gov-black">Apellido</label>
                            <Input 
                              value={userFormData.last_name}
                              onChange={(e) => setUserFormData(prev => ({ ...prev, last_name: e.target.value }))}
                              placeholder="Ingrese el apellido" 
                              className="mt-1" 
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gov-black">Email</label>
                          <Input 
                            type="email" 
                            value={userFormData.email}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="usuario@digital.gob.cl" 
                            className="mt-1" 
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gov-black">Usuario</label>
                          <Input 
                            value={userFormData.username}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, username: e.target.value }))}
                            placeholder="nombre.usuario" 
                            className="mt-1" 
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gov-black">Rol</label>
                          <select 
                            value={userFormData.role}
                            onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value }))}
                            className="mt-1 w-full px-3 py-2 border border-gov-accent rounded-md focus:outline-none focus:ring-2 focus:ring-gov-primary"
                          >
                            <option value="Observador">Observador</option>
                            <option value="Técnico">Técnico</option>
                            <option value="Administrador">Administrador</option>
                          </select>
                        </div>
                        
                        {userError && (
                          <div className="p-2 bg-gov-secondary text-white rounded text-sm">
                            {userError}
                          </div>
                        )}
                        
                        <div className="flex space-x-2 pt-4">
                          <Button 
                            type="submit"
                            className="flex-1 bg-gov-primary text-white hover:bg-gov-primary/90"
                            disabled={usersLoading}
                          >
                            {usersLoading ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear Usuario')}
                          </Button>
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowUserForm(false);
                              setEditingUser(null);
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Stations Tab */}
          {activeTab === "stations" && (
            <Card className="bg-gov-white border-gov-accent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-gov-black">Gestión de Estaciones</CardTitle>
                    <CardDescription className="text-gov-gray-a">
                      Administrar estaciones de monitoreo
                    </CardDescription>
                  </div>
                  <Button 
                    className="bg-gov-green text-white hover:bg-gov-green/90"
                    onClick={() => {
                      setEditingStation(null);
                      setShowStationForm(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Estación
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stations.map((station) => (
                    <div
                      key={station.id}
                      className="p-4 rounded-lg border border-gov-accent bg-gov-white"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <MapPin className="h-8 w-8 text-gov-primary" />
                          <div>
                            <p className="font-medium text-gov-black">{station.name}</p>
                            <p className="text-sm text-gov-gray-a">{station.location}</p>
                            <p className="text-xs font-mono text-gov-gray-b">{station.code}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className={`font-bold ${
                              station.current_level > station.threshold ? 'text-gov-secondary' : 'text-gov-green'
                            }`}>
                              {station.current_level}m
                            </p>
                            <p className="text-xs text-gov-gray-b">
                              Umbral: {station.threshold}m
                            </p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium text-white ${
                            station.status === "active" ? 'bg-gov-green' : 'bg-gov-orange'
                          }`}>
                            {station.status === "active" ? "Activa" : "Mantenimiento"}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-transparent border-gov-primary text-gov-primary"
                              onClick={() => {
                                setEditingStation(station);
                                setShowStationForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-transparent border-gov-secondary text-gov-secondary"
                              onClick={() => setStationToDelete(station)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Station Form Modal */}
          {showStationForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="bg-gov-white border-gov-accent w-full max-w-md mx-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gov-black">
                      {editingStation ? 'Editar Estación' : 'Nueva Estación'}
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setShowStationForm(false);
                        setEditingStation(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitStation} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gov-black">Nombre</label>
                      <Input 
                        value={stationFormData.name}
                        onChange={(e) => setStationFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Río Claro Norte" 
                        className="mt-1" 
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gov-black">Código</label>
                      <Input 
                        value={stationFormData.code}
                        onChange={(e) => setStationFormData(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="RCN-001" 
                        className="mt-1" 
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gov-black">Ubicación</label>
                      <Input 
                        value={stationFormData.location}
                        onChange={(e) => setStationFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Sector Norte, km 15" 
                        className="mt-1" 
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gov-black">Latitud</label>
                        <Input 
                          type="number"
                          step="any"
                          value={stationFormData.latitude}
                          onChange={(e) => setStationFormData(prev => ({ ...prev, latitude: e.target.value }))}
                          placeholder="-36.7485" 
                          className="mt-1" 
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gov-black">Longitud</label>
                        <Input 
                          type="number"
                          step="any"
                          value={stationFormData.longitude}
                          onChange={(e) => setStationFormData(prev => ({ ...prev, longitude: e.target.value }))}
                          placeholder="-72.1219" 
                          className="mt-1" 
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gov-black">Umbral Crítico (m)</label>
                      <Input 
                        type="number"
                        step="0.1"
                        value={stationFormData.threshold}
                        onChange={(e) => setStationFormData(prev => ({ ...prev, threshold: e.target.value }))}
                        placeholder="3.0" 
                        className="mt-1" 
                        required
                      />
                    </div>
                    
                    {stationError && (
                      <div className="p-2 bg-gov-secondary text-white rounded text-sm">
                        {stationError}
                      </div>
                    )}
                    
                    <div className="flex space-x-2 pt-4">
                      <Button 
                        type="submit"
                        className="flex-1 bg-gov-green text-white hover:bg-gov-green/90"
                        disabled={stationsLoading}
                      >
                        {stationsLoading ? 'Guardando...' : (editingStation ? 'Actualizar' : 'Crear Estación')}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowStationForm(false);
                          setEditingStation(null);
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === "assignments" && (
            <Card className="bg-gov-white border-gov-accent">
              <CardHeader>
                <CardTitle className="text-gov-black">Asignaciones Usuario-Estación</CardTitle>
                <CardDescription className="text-gov-gray-a">
                  Gestionar qué usuarios tienen acceso a qué estaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 rounded-lg border border-gov-accent bg-gov-white"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gov-primary text-white flex items-center justify-center">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gov-black">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-sm text-gov-gray-a">{user.role}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent border-gov-primary text-gov-primary"
                        >
                          Editar Asignaciones
                        </Button>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-2 text-gov-gray-a">
                          Estaciones asignadas:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {user.assigned_stations.map((stationId) => {
                            const station = stations.find((s) => s.id === stationId);
                            return station ? (
                              <div
                                key={stationId}
                                className="px-2 py-1 rounded border border-gov-green text-gov-green text-xs"
                              >
                                {station.name}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerts Tab */}
          {activeTab === "alerts" && (
            <div className="space-y-6">
              {/* Alertas Activas */}
              <Card className="bg-gov-white border-gov-accent">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gov-secondary">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Alertas Activas ({mockActiveAlerts.length})</span>
                  </CardTitle>
                  <CardDescription>Estado actual de las alertas del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockActiveAlerts.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 mx-auto text-gov-green mb-4" />
                        <p className="text-gov-gray-a">No hay alertas activas</p>
                      </div>
                    ) : (
                      mockActiveAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-4 rounded-lg text-white ${
                            alert.type === 'critical' ? 'bg-gov-secondary' : 'bg-gov-orange'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {alert.type === 'critical' ? (
                                <AlertTriangle className="h-5 w-5" />
                              ) : (
                                <AlertCircle className="h-5 w-5" />
                              )}
                              <div>
                                <p className="font-medium">{alert.station_name}</p>
                                <p className="text-sm opacity-90">
                                  {alert.message} ({alert.level}m {alert.type === 'critical' ? '>' : '≈'} {alert.threshold}m)
                                </p>
                                <p className="text-xs opacity-75 mt-1">
                                  {new Date(alert.created_at).toLocaleString('es-CL')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`px-2 py-1 rounded text-xs font-medium ${
                                alert.type === 'critical' ? 'bg-white text-gov-secondary' : 'bg-white text-gov-orange'
                              }`}>
                                {alert.type === 'critical' ? 'CRÍTICO' : 'ADVERTENCIA'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Modules Tab */}
          {activeTab === "modules" && (
            <Card className="bg-gov-white border-gov-accent">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gov-black">
                  <Settings className="h-5 w-5 text-gov-primary" />
                  <span>Configuración de Módulos</span>
                </CardTitle>
                <CardDescription>
                  Activa o desactiva módulos del sistema de monitoreo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div
                      key={module.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        module.active
                          ? module.required
                            ? 'bg-gov-primary/10 border-gov-primary/30'
                            : 'bg-gov-green/10 border-gov-green/30'
                          : 'bg-gov-white border-gov-accent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          module.active ? 'bg-gov-green' : 'bg-gov-gray-a'
                        }`} />
                        <div>
                          <p className="font-medium text-gov-black">{module.name}</p>
                          <p className="text-sm text-gov-gray-b">{module.description}</p>
                          {module.required && (
                            <p className="text-xs text-gov-primary mt-1">* Módulo obligatorio</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className={`text-sm font-medium ${
                          module.active 
                            ? module.required ? 'text-gov-primary' : 'text-gov-green'
                            : 'text-gov-gray-a'
                        }`}>
                          {module.active ? 'Activo' : 'Inactivo'}
                        </div>
                        
                        {!module.required && (
                          <Button
                            variant={module.active ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleModule(module.id)}
                            className={module.active 
                              ? "bg-transparent border-gov-secondary text-gov-secondary hover:bg-gov-secondary hover:text-white" 
                              : "bg-gov-green text-white hover:bg-gov-green/90"
                            }
                          >
                            {module.active ? 'Desactivar' : 'Activar'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Delete Confirmation Modals */}
        {userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="bg-gov-white border-gov-accent w-full max-w-sm mx-4">
              <CardHeader>
                <CardTitle className="text-gov-black flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-gov-secondary" />
                  <span>Confirmar Eliminación</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gov-gray-a mb-4">
                  ¿Está seguro que desea eliminar al usuario <strong>{userToDelete.first_name} {userToDelete.last_name}</strong>?
                </p>
                <p className="text-sm text-gov-gray-b mb-4">
                  Esta acción no se puede deshacer.
                </p>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleDeleteUser}
                    className="flex-1 bg-gov-secondary text-white hover:bg-gov-secondary/90"
                    disabled={usersLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {usersLoading ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setUserToDelete(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {stationToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="bg-gov-white border-gov-accent w-full max-w-sm mx-4">
              <CardHeader>
                <CardTitle className="text-gov-black flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-gov-secondary" />
                  <span>Confirmar Eliminación</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gov-gray-a mb-4">
                  ¿Está seguro que desea eliminar la estación <strong>{stationToDelete.name}</strong>?
                </p>
                <p className="text-sm text-gov-gray-b mb-4">
                  Esta acción no se puede deshacer y se perderán todos los datos asociados.
                </p>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleDeleteStation}
                    className="flex-1 bg-gov-secondary text-white hover:bg-gov-secondary/90"
                    disabled={stationsLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {stationsLoading ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setStationToDelete(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}