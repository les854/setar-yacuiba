FROM nginx:1.27-alpine

# Copiar los archivos compilados de la aplicación
COPY dist/ /usr/share/nginx/html/

# Copiar la configuración personalizada de Nginx para las rutas (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]