FROM mysql:8.0

# Variables de entorno por defecto
ENV MYSQL_DATABASE=rioclaro_db
ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_USER=rioclaro_user
ENV MYSQL_PASSWORD=rioclaro_pass

# Configuración MySQL personalizada
COPY docker/mysql.cnf /etc/mysql/conf.d/

# Scripts de inicialización
COPY database/ /docker-entrypoint-initdb.d/

# Expone puerto estándar
EXPOSE 3306
