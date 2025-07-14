# Use the official Nginx image as base
FROM nginx:alpine

# Set maintainer information
LABEL maintainer="Poutchouli"
LABEL description="Shared Mailbox Manager - A web-based tool for managing Microsoft Exchange shared mailbox access permissions"
LABEL version="1.0.0"

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy our application files to nginx html directory
COPY . /usr/share/nginx/html/

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Create a non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S -D -H -u 1001 -s /sbin/nologin -G appgroup appuser

# Set proper permissions
RUN chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /etc/nginx/conf.d

# Create directories for nginx
RUN touch /var/run/nginx.pid && \
    chown -R appuser:appgroup /var/run/nginx.pid

# Switch to non-root user
USER appuser

# Expose port 80 (will be mapped to 17652 externally)
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
