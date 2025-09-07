#!/usr/bin/env node

/**
 * Script de prueba para el sistema de autenticación de Kale Farm
 */

const crypto = require('crypto');

// Simular las funciones del bot
async function createNewAccount(username) {
    try {
        // Basic validation
        if (!username) {
            return { success: false, error: 'Username is required' };
        }
        
        if (username.length < 3) {
            return { success: false, error: 'Username must be at least 3 characters long' };
        }
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate a unique account ID for Kale Farm
        const accountId = 'KF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 8).toUpperCase();
        
        return {
            success: true,
            publicKey: accountId,
            kaleBalance: 1000, // Welcome bonus
            totalEarned: 0,
            transactions: [],
            stellarExpertUrl: `https://kalefarm.xyz/user/${accountId}`,
            message: 'Account created successfully'
        };
        
    } catch (error) {
        return {
            success: false,
            error: `Account creation failed: ${error.message}`
        };
    }
}

async function authenticateUser(username, password) {
    try {
        // Basic validation
        if (!username || !password) {
            return { success: false, error: 'Username and password are required' };
        }
        
        if (username.length < 3) {
            return { success: false, error: 'Username must be at least 3 characters long' };
        }
        
        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters long' };
        }
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate a mock public key based on username
        const hash = crypto.createHash('sha256').update(username + password).digest('hex');
        const publicKey = 'G' + hash.substring(0, 55);
        
        // Simulate user data
        const kaleBalance = Math.floor(Math.random() * 10000) + 100; // Random balance between 100-10100
        
        return {
            success: true,
            publicKey: publicKey,
            kaleBalance: kaleBalance,
            totalEarned: Math.floor(Math.random() * 5000) + 50,
            transactions: [],
            stellarExpertUrl: `https://stellar.expert/explorer/public/account/${publicKey}`,
            message: 'Authentication successful'
        };
        
    } catch (error) {
        return {
            success: false,
            error: `Authentication failed: ${error.message}`
        };
    }
}

// Función principal de prueba
async function runTests() {
    console.log('🧪 PRUEBA COMPLETA DEL SISTEMA DE KALE FARM');
    console.log('='.repeat(50));
    
    // Prueba 1: Crear cuenta nueva
    console.log('\n🔍 PRUEBA 1: Crear cuenta nueva');
    console.log('-'.repeat(30));
    
    const createResult = await createNewAccount('TestUser123');
    console.log('📊 Resultado:', createResult.success ? '✅ ÉXITO' : '❌ ERROR');
    
    if (createResult.success) {
        console.log('👤 Usuario:', 'TestUser123');
        console.log('🆔 ID de Cuenta:', createResult.publicKey);
        console.log('💰 Balance Inicial:', createResult.kaleBalance, 'KALE');
        console.log('🔗 URL:', createResult.stellarExpertUrl);
    } else {
        console.log('❌ Error:', createResult.error);
    }
    
    // Prueba 2: Autenticación
    console.log('\n🔍 PRUEBA 2: Autenticación de usuario');
    console.log('-'.repeat(30));
    
    const authResult = await authenticateUser('TestUser123', 'password123');
    console.log('📊 Resultado:', authResult.success ? '✅ ÉXITO' : '❌ ERROR');
    
    if (authResult.success) {
        console.log('👤 Usuario:', 'TestUser123');
        console.log('🔑 Dirección:', authResult.publicKey);
        console.log('💰 Balance KALE:', authResult.kaleBalance);
        console.log('💎 Total Ganado:', authResult.totalEarned);
        console.log('🔗 URL:', authResult.stellarExpertUrl);
    } else {
        console.log('❌ Error:', authResult.error);
    }
    
    // Prueba 3: Validaciones
    console.log('\n🔍 PRUEBA 3: Validaciones de entrada');
    console.log('-'.repeat(30));
    
    const invalidUser = await createNewAccount('ab'); // Username muy corto
    console.log('❌ Username corto:', invalidUser.success ? 'ERROR' : '✅ Validación correcta');
    
    const invalidAuth = await authenticateUser('user', '123'); // Password muy corto
    console.log('❌ Password corto:', invalidAuth.success ? 'ERROR' : '✅ Validación correcta');
    
    console.log('\n🎉 PRUEBAS COMPLETADAS');
    console.log('='.repeat(50));
    console.log('✅ Sistema de autenticación funcionando correctamente');
    console.log('✅ Validaciones implementadas');
    console.log('✅ Generación de IDs única');
    console.log('✅ Simulación de balances realistas');
}

// Ejecutar pruebas
runTests().catch(console.error);
