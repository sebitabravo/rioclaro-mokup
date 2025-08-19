import { useEffect, useState } from "react";
import { Navbar } from "@presentation/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@presentation/components/ui/card";
import { Button } from "@presentation/components/ui/button";
import { Input } from "@presentation/components/ui/input";
import { Users, MapPin, UserCheck, Plus, Edit, Trash2 } from "lucide-react";
import { useUserStore } from "@presentation/stores/UserStore";
import { useStationStore } from "@presentation/stores/StationStore";

export function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");
  const { users, loading: usersLoading, fetchUsers } = useUserStore();
  const { stations, loading: stationsLoading, fetchStations } = useStationStore();

  useEffect(() => {
    fetchUsers();
    fetchStations();
  }, [fetchUsers, fetchStations]);

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
                    <Button className="bg-gov-primary text-white hover:bg-gov-primary/90">
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
                              <Button variant="outline" size="sm" className="bg-transparent border-gov-primary text-gov-primary">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="bg-transparent border-gov-secondary text-gov-secondary">
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

              {/* New User Form */}
              <Card className="bg-gov-white border-gov-accent">
                <CardHeader>
                  <CardTitle className="text-gov-black">Crear Nuevo Usuario</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gov-black">Nombre</label>
                      <Input placeholder="Ingrese el nombre" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gov-black">Apellido</label>
                      <Input placeholder="Ingrese el apellido" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gov-black">Email</label>
                      <Input type="email" placeholder="usuario@digital.gob.cl" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gov-black">Usuario</label>
                      <Input placeholder="nombre.usuario" className="mt-1" />
                    </div>
                  </div>
                  <Button className="mt-4 bg-gov-primary text-white hover:bg-gov-primary/90">
                    Crear Usuario
                  </Button>
                </CardContent>
              </Card>
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
                  <Button className="bg-gov-green text-white hover:bg-gov-green/90">
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
                            <Button variant="outline" size="sm" className="bg-transparent border-gov-primary text-gov-primary">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="bg-transparent border-gov-secondary text-gov-secondary">
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
        </div>
      </main>
    </div>
  );
}