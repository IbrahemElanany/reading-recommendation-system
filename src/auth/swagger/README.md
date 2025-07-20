# Auth Swagger Documentation

This directory contains dedicated Swagger documentation files for the authentication module.

## 📁 File Structure

```
src/auth/swagger/
├── auth.swagger.ts          # Auth-specific Swagger DTOs and constants
└── README.md               # This documentation file
```

## 🏗️ Architecture

### **Modular Approach**
- **Separate Swagger files** for each module
- **Common constants** in `src/common/swagger/swagger.constants.ts`
- **Reusable patterns** across the application

### **Benefits**
- ✅ **Clean separation** of concerns
- ✅ **Reusable components** across modules
- ✅ **Type safety** with TypeScript
- ✅ **Consistent patterns** throughout the API
- ✅ **Easy maintenance** and updates

## 📋 Components

### **Request DTOs**
- `RegisterRequestDto` - User registration data
- `LoginRequestDto` - User login credentials

### **Response DTOs**
- `UserResponseDto` - User information
- `LoginResponseDto` - Login response with JWT token
- `ApiResponseDto<T>` - Generic success response wrapper
- `ErrorResponseDto` - Generic error response wrapper

### **Constants**
- `AUTH_SWAGGER` - Centralized configuration object
- Response patterns, examples, and descriptions

## 🔧 Usage

### **In Controllers**
```typescript
import { AUTH_SWAGGER, RegisterRequestDto } from './swagger/auth.swagger';

@ApiTags(AUTH_SWAGGER.tags.name)
@Controller('auth')
export class AuthController {
  @Post('register')
  @ApiOperation(AUTH_SWAGGER.register)
  @ApiBody({ type: RegisterRequestDto })
  @ApiResponse(AUTH_SWAGGER.responses.registerSuccess)
  register(@Body() dto: RegisterDto) {
    // Implementation
  }
}
```

### **Common Patterns**
```typescript
// Using common field patterns
@ApiProperty(SWAGGER_CONSTANTS.fields.email)
email: string;

// Using common response patterns
@ApiResponse({
  status: SWAGGER_CONSTANTS.statusCodes.created,
  description: SWAGGER_CONSTANTS.responses.success.description,
  type: BaseSuccessResponseDto<UserResponseDto>,
})
```

## 🎯 Best Practices

### **1. Use Common Constants**
- Leverage `SWAGGER_CONSTANTS` for consistent patterns
- Avoid duplicating field definitions

### **2. Type Safety**
- Use TypeScript classes with `@ApiProperty` decorators
- Ensure proper type definitions for generics

### **3. Comprehensive Documentation**
- Include detailed descriptions for all fields
- Provide realistic examples
- Document all possible response scenarios

### **4. Error Handling**
- Document all error responses (400, 401, 409, 500)
- Use consistent error response patterns
- Include validation error details

### **5. Examples**
- Provide multiple examples for complex endpoints
- Include both basic and advanced use cases
- Show different parameter combinations

## 🔄 Extending

### **Adding New Endpoints**
1. Create new DTOs in the Swagger file
2. Add constants to `AUTH_SWAGGER`
3. Update controller with new decorators
4. Test in Swagger UI

### **Adding New Modules**
1. Create `src/module-name/swagger/` directory
2. Create `module-name.swagger.ts` file
3. Follow the same patterns as auth module
4. Import common constants as needed

## 📚 Related Files

- `src/common/swagger/swagger.constants.ts` - Common patterns and constants
- `src/auth/auth.controller.ts` - Controller using Swagger decorators
- `src/auth/dto/` - Validation DTOs (separate from Swagger DTOs)

## 🚀 Benefits

- **Developer Experience**: Clear, comprehensive API documentation
- **Consistency**: Standardized patterns across all endpoints
- **Maintainability**: Easy to update and extend
- **Type Safety**: Full TypeScript support with proper types
- **Testing**: Easy to test with provided examples 