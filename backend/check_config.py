#!/usr/bin/env python3
# backend/check_config.py - Script para verificar configuración

import os
import sys
from config import Config

def check_database_connection():
    """Verificar conexión a la base de datos"""
    try:
        from sqlalchemy import create_engine, text
        engine = create_engine(Config.SQLALCHEMY_DATABASE_URI)
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            return True, "✅ Conexión a la base de datos exitosa"
    except Exception as e:
        return False, f"❌ Error de conexión a la base de datos: {str(e)}"

def check_upload_folder():
    """Verificar directorio de uploads"""
    upload_folder = Config.UPLOAD_FOLDER
    
    if not os.path.exists(upload_folder):
        try:
            os.makedirs(upload_folder)
            return True, f"✅ Directorio {upload_folder} creado"
        except Exception as e:
            return False, f"❌ Error creando directorio {upload_folder}: {str(e)}"
    else:
        return True, f"✅ Directorio {upload_folder} existe"

def check_environment_variables():
    """Verificar variables de entorno importantes"""
    checks = []
    
    # Variables críticas
    critical_vars = {
        'ENVIRONMENT': os.environ.get('ENVIRONMENT', 'development'),
        'DATABASE_URL': os.environ.get('DATABASE_URL', 'No configurada (usando local)'),
        'JWT_SECRET_KEY': '✅ Configurada' if os.environ.get('JWT_SECRET_KEY') else '⚠️ Usando valor por defecto',
        'SECRET_KEY': '✅ Configurada' if os.environ.get('SECRET_KEY') else '⚠️ Usando valor por defecto'
    }
    
    return critical_vars

def main():
    """Ejecutar todas las verificaciones"""
    print("🔍 VERIFICACIÓN DE CONFIGURACIÓN")
    print("=" * 50)
    
    # Información del entorno
    print(f"\n📊 ENTORNO ACTUAL:")
    print(f"   Modo: {Config.ENVIRONMENT}")
    print(f"   Debug: {Config.DEBUG}")
    print(f"   Base de datos: {Config.SQLALCHEMY_DATABASE_URI}")
    print(f"   Directorio uploads: {Config.UPLOAD_FOLDER}")
    
    # Variables de entorno
    print(f"\n🔐 VARIABLES DE ENTORNO:")
    env_vars = check_environment_variables()
    for var, status in env_vars.items():
        print(f"   {var}: {status}")
    
    # Verificar base de datos
    print(f"\n💾 BASE DE DATOS:")
    db_success, db_message = check_database_connection()
    print(f"   {db_message}")
    
    # Verificar directorio de uploads
    print(f"\n📁 DIRECTORIO DE UPLOADS:")
    upload_success, upload_message = check_upload_folder()
    print(f"   {upload_message}")
    
    # Resumen final
    print(f"\n📋 RESUMEN:")
    all_good = db_success and upload_success
    
    if all_good:
        print("   ✅ Configuración lista para deploy")
        return 0
    else:
        print("   ❌ Hay problemas que resolver antes del deploy")
        return 1

if __name__ == '__main__':
    sys.exit(main())
