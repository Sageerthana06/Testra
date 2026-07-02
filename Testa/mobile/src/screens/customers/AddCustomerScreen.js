import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';

// ✅ சரியான code — இப்படி இருக்கணும்
const API_BASE_URL = 'http://192.168.8.167:5001';// ✅ Change this to your server IP

export default function AddCustomerScreen({ navigation }) {
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        country: '',
        address: '',
    });

    // ✅ Refs for keyboard "next" navigation
    const contactRef = useRef();
    const phoneRef = useRef();
    const emailRef = useRef();
    const countryRef = useRef();
    const addressRef = useRef();

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    // ✅ Validate email format
    const isValidEmail = (email) => {
        if (!email) return true; // email is optional
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // ✅ Validate phone (digits, +, -, space only)
    const isValidPhone = (phone) => {
        return /^[0-9+\-\s]{7,15}$/.test(phone.trim());
    };

    const handleSave = async () => {
        // ── Validation ──────────────────────────────────────
        if (!form.companyName.trim()) {
            Alert.alert('Validation Error', 'Company Name is required');
            return;
        }
        if (!form.phone.trim()) {
            Alert.alert('Validation Error', 'Phone number is required');
            return;
        }
        if (!isValidPhone(form.phone)) {
            Alert.alert('Validation Error', 'Enter a valid phone number (7–15 digits)');
            return;
        }
        if (!isValidEmail(form.email)) {
            Alert.alert('Validation Error', 'Enter a valid email address');
            return;
        }

        // ── Prepare clean payload ────────────────────────────
        const payload = {
            company_name: form.companyName.trim(),
            contact_person: form.contactPerson.trim(),
            phone: form.phone.trim(),
            email: form.email.trim().toLowerCase(),
            country: form.country.trim(),
            address: form.address.trim(),
        };

        // ✅ Debug: confirm payload before sending
        console.log('📤 Sending Customer Payload:', JSON.stringify(payload, null, 2));

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${your_token}`, // ✅ Add if you use JWT auth
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            console.log('📥 Server Response:', result);

            if (response.ok) {
                Alert.alert('✅ Success', 'Customer added successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ]);
            } else {
                Alert.alert('❌ Error', result.message || 'Failed to save customer');
            }

        } catch (error) {
            console.error('🔴 API Error:', error);
            Alert.alert('❌ Network Error', 'Could not connect to server.\nCheck your internet/server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>➕ Add Customer</Text>

                {/* Company Name */}
                <Text style={styles.label}>Company Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                    placeholder="e.g. Goldex Global Imports LLC"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    value={form.companyName}
                    onChangeText={text => handleChange('companyName', text)}
                    autoCorrect={false}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => contactRef.current?.focus()}
                    blurOnSubmit={false}
                />

                {/* Contact Person */}
                <Text style={styles.label}>Contact Person</Text>
                <TextInput
                    ref={contactRef}
                    placeholder="e.g. John Doe"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    value={form.contactPerson}
                    onChangeText={text => handleChange('contactPerson', text)}
                    autoCorrect={false}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => phoneRef.current?.focus()}
                    blurOnSubmit={false}
                />

                {/* Phone */}
                <Text style={styles.label}>Phone <Text style={styles.required}>*</Text></Text>
                <TextInput
                    ref={phoneRef}
                    placeholder="e.g. +94711234567"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    keyboardType="phone-pad"
                    value={form.phone}
                    onChangeText={text => {
                        const cleaned = text.replace(/[^0-9+\-\s]/g, '');
                        handleChange('phone', cleaned);
                    }}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="next"
                    maxLength={15}
                    onSubmitEditing={() => emailRef.current?.focus()}
                    blurOnSubmit={false}
                />

                {/* Email */}
                <Text style={styles.label}>Email</Text>
                <TextInput
                    ref={emailRef}
                    placeholder="e.g. john@company.com"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={form.email}
                    onChangeText={text => handleChange('email', text.trim())}
                    returnKeyType="next"
                    onSubmitEditing={() => countryRef.current?.focus()}
                    blurOnSubmit={false}
                />

                {/* Country */}
                <Text style={styles.label}>Country</Text>
                <TextInput
                    ref={countryRef}
                    placeholder="e.g. Sri Lanka"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    value={form.country}
                    onChangeText={text => handleChange('country', text)}
                    autoCorrect={false}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => addressRef.current?.focus()}
                    blurOnSubmit={false}
                />

                {/* Address */}
                <Text style={styles.label}>Address</Text>
                <TextInput
                    ref={addressRef}
                    placeholder="e.g. No.25, Main Street, Colombo"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    value={form.address}
                    onChangeText={text => handleChange('address', text)}
                    autoCorrect={false}
                    autoCapitalize="sentences"
                    returnKeyType="done"
                    blurOnSubmit={true}
                />

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>💾 Save Customer</Text>
                    }
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    container: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 50,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 25,
        textAlign: 'center',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 5,
        marginLeft: 2,
    },
    required: {
        color: '#EF4444',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 15,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
        marginBottom: 15,
    },
    textArea: {
        height: 120,
    },
    button: {
        backgroundColor: '#2563EB',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 30,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
});