# Password Reset Implementation - Code Review

## Przegląd zmian
Implementacja funkcjonalności resetowania hasła obejmuje:
- Backend endpoints: `/auth/forgot-password` i `/auth/reset-password`
- Frontend strony: `/forgot-password` i `/reset-password/[token]`
- Nowe komponenty UI i testy e2e

## ❌ Krytyczne problemy bezpieczeństwa

### 1. Niezabezpieczony reset token
**Lokalizacja:** `backend/app/models/user.py:113-125`
```python
# Generate reset token (in production, use cryptographically secure token)
import secrets
token = secrets.token_urlsafe(32)
```

**Problem:**
- Reset token jest przechowywany w plain text w pamięci
- Brak hashowania tokena przed zapisem
- Potencjalny wyciek tokenów w logach/dumps

**Rekomendacja:**
- Użyj tego samego systemu JWT co w pozostałych tokenach
- Jeśli używasz custom tokenów, zastosuj hashing (bcrypt/argon2)
- Nigdy nie loguj tokenów w plain text

### 2. Timing attack vulnerability
**Lokalizacja:** `backend/app/models/user.py:41-49`
```python
def is_reset_token_valid(self, token: str) -> bool:
    if self.resetToken != token:  # Podatne na timing attack
        return False
```

**Problem:** Porównanie stringów może być podatne na timing attack

**Rekomendacja:**
```python
import secrets
def is_reset_token_valid(self, token: str) -> bool:
    if not self.resetToken or not self.resetTokenExpiry:
        return False
    if not secrets.compare_digest(self.resetToken, token):  # Safe comparison
        return False
    # ... rest of validation
```

### 3. Brak walidacji siły hasła
**Lokalizacja:** `frontend/src/components/auth/reset-password-form.tsx:20-25`

**Problem:** Reset password używa tylko podstawowej walidacji długości (8 znaków)

**Rekomendacja:** Użyj tej samej walidacji co w rejestracji (wielkość liter, cyfry, znaki specjalne)

## ⚠️ Problemy implementacyjne

### 4. Import wewnątrz metody
**Lokalizacja:** `backend/app/models/user.py:118-122`
```python
def generate_reset_token(self, email: str) -> Optional[str]:
    # ...
    import secrets  # Import should be at top level
    token = secrets.token_urlsafe(32)

    from datetime import timedelta  # Also imports should be at top
```

**Rekomendacja:** Przenieś importy na górę pliku

### 5. Błąd w istniejącym kodzie
**Lokalizacja:** `backend/app/api/auth.py:72-73`
```python
# Create tokens
access_token =  # Niepełna linia!
refresh_token = create_refresh_token(data={"sub": user.id})
```

**Problem:** Niepełna linia kodu w login endpoint

### 6. Hook używany poza komponentem (naprawione)
**Lokalizacja:** `frontend/src/components/layout/nabarUser.tsx:6-8`

**Problem był naprawiony:** Hook `useAuth` został przeniesiony do wnętrza komponentu ✅

## 🔧 Problemy architektoniczne

### 7. Brak infrastruktury email
**Lokalizacja:** `backend/app/api/auth.py:152`
```python
# TODO: Send email with reset link
# await send_password_reset_email(forgot_request.email, token)
```

**Problem:** Brak kompletnej implementacji wysyłania emaili

**Rekomendacja:**
- Dodaj email service (np. z użyciem `fastapi-mail` lub `sendgrid`)
- Implementuj templates dla emaili resetujących hasło
- Dodaj konfigurację SMTP w settings

### 8. Niespójna architektura tokenów
**Problem:** Reset tokeny używają innego systemu niż JWT używane gdzie indziej

**Rekomendacja:** Użyj JWT z typem "password_reset" dla spójności:
```python
def create_password_reset_token(data: Dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    to_encode.update({
        "exp": expire,
        "type": "password_reset",
        "iat": datetime.now(timezone.utc)
    })
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.jwt_algorithm)
```

### 9. Brak auditingu bezpieczeństwa
**Problem:** Brak logowania prób resetowania hasła dla celów bezpieczeństwa

**Rekomendacja:** Dodaj logging:
- Wszystkie próby resetowania hasła
- Użycie tokenów resetujących
- Błędne tokeny

## 📱 Problemy UI/UX

### 10. Niezabezpieczona nawigacja
**Lokalizacja:** `frontend/src/components/auth/reset-password-form.tsx:72-74`
```typescript
setTimeout(() => {
  router.push('/login')  // Niezabezpieczona nawigacja
}, 3000)
```

**Problem:** Auto-redirect może być anulowany przez użytkownika

**Rekomendacja:** Dodaj cleanup dla timeout'u w useEffect

### 11. Brak obsługi edge cases
**Frontend problemy:**
- Brak sprawdzenia czy token jest prawidłowy format przed wysłaniem
- Brak obsługi sytuacji gdy user próbuje użyć tego samego tokena dwukrotnie
- Brak informacji o czasie wygaśnięcia tokena

## ✅ Pozytywne aspekty

### Dobrze zaimplementowane:
1. **Bezpieczeństwo podstawowe:**
   - Zawsze zwraca ten sam komunikat (nie ujawnia czy email istnieje)
   - Rate limiting stosowane na wszystkich endpoint'ach

2. **UX:**
   - Dobre komunikaty dla użytkownika
   - Loading states i error handling
   - Responsive design

3. **Walidacja:**
   - Proper validation schemas z Zod
   - Type safety w TypeScript

4. **Testy:**
   - Kompleksowe testy Playwright covering happy path i edge cases
   - Dobre mockowanie API responses

## 🚀 Rekomendacje ulepszeń

### Wysokий priorytet:
1. **Zabezpiecz reset tokeny** - użyj JWT lub hash token przed zapisem
2. **Napraw błąd w login endpoint** - dokończ linię access_token creation
3. **Dodaj email service** - kompletna implementacja wysyłania emaili
4. **Dodaj security logging** - audit trail dla reset attempts

### Średni priorytet:
5. **Ulepsz walidację hasła** - użyj tej samej logiki co w rejestracji
6. **Dodaj cleanup timeouts** - proper useEffect cleanup w React components
7. **Standaryzuj tokeny** - użyj JWT dla wszystkich tokenów

### Niski priorytet:
8. **Dodaj metrics** - śledzenie usage password reset feature
9. **Ulepsz error messages** - bardziej specificzne komunikaty błędów
10. **Dodaj expires info** - informuj użytkownika o czasie wygaśnięcia tokena

## 📊 Ocena ogólna

**Bezpieczeństwo:** 6/10 - Podstawowe zabezpieczenia OK, ale krytyczne luki w tokenach
**Kod Quality:** 7/10 - Dobra struktura, ale kilka problemów implementacyjnych
**UX:** 8/10 - Bardzo dobry user experience i error handling
**Testy:** 9/10 - Excellentne pokrycie testami

**Ogólna ocena:** 7/10 - Solidna implementacja z kilkoma krytycznymi problemami do naprawienia

## 🔧 Akcje do wykonania przed merge:

1. [ ] **KRYTYCZNE** - Napraw błąd w login endpoint
2. [ ] **KRYTYCZNE** - Zabezpiecz reset tokeny (hash lub JWT)
3. [ ] **WYSOKI** - Dodaj email service albo remove print statement z production
4. [ ] **ŚREDNI** - Dodaj security logging dla reset attempts
5. [ ] **ŚREDNI** - Fix timeout cleanup w React components

Pozostałe problemy mogą być adresowane w kolejnych iteracjach.
