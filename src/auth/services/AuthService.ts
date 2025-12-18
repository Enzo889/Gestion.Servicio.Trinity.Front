import axiosInstance from "../../config/axiosConfig";
import axios from "axios";
import axiosPublic from "../../config/axiosConfigPublic";
import { LoginRequestDto } from "../../core/models/dto/LoginRequestDto";
import { AuthResponseDto } from "../../core/models/dto/AuthResponseDto";
import { ForgotPassDto } from "../../core/models/dto/ForgotPassDto";
import { WebApiResponse } from "../../core/models/types/WebApiResponse";
import { RecoverPassDto } from "../../core/models/dto/RecoverPassDto";

// Servicio de autenticación
const AuthService = {
  // Función para hacer login
  async login(credentials: LoginRequestDto): Promise<AuthResponseDto> {
    try {
      const response = await axiosInstance.post<WebApiResponse<AuthResponseDto>>("/auth/login", credentials);
      const { success, data, error, statusCode } = response.data;
      
      // Si la respuesta es exitosa, guarda el token en el local storage
      if (success) {
        const token = data.token;
        AuthService.saveToken(token);
        return data;
      }

      switch (statusCode) {
        case 401:
          throw new Error("Usuario o contraseña incorrectos");
        case 403:
          throw new Error("No tienes permisos para acceder");
        case 500:
          throw new Error("Error interno del servidor, inténtalo más tarde");
        default:
          throw new Error(error || "Error en el inicio de sesión");
      }
    } catch (e: any) {
      if (axios.isAxiosError(e)) {
        throw new Error("No se pudo conectar con el servidor, inténtalo más tarde.");
      }
      throw e;
    }
  },

  // Funcion para recuperar contraseña
  async recoverPassword(credentials: ForgotPassDto): Promise<void> {
    try {
      const response = await axiosPublic.post<WebApiResponse<void>>("/auth/forgot", credentials);
      const {success, message} = response.data
      
      if (!success) {
        throw new Error(
          message || "No se pudo recuperar la contraseña, inténtalo mas tarde."
        );
      }

    } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          throw new Error("No se pudo conectar con el servidor, inténtalo más tarde.");
        }
        throw e;
    }
  },

  // Funcion para cambiar contraseña
  async changePassword(credentials: RecoverPassDto): Promise<void> {
    try {
      const response = await axiosPublic.post<WebApiResponse<void>>("/auth/reset",credentials);
      const {success, message} = response.data
      
      if (!success) {
        throw new Error(
          message || "Error al cambiar la contraseña"
        );
      }
    } catch (e: unknown) {
        if (axios.isAxiosError(e)) {
          throw new Error("No se pudo conectar con el servidor, inténtalo más tarde");
        }
        throw e;
    }
  },

  // Función para hacer logout (borra el token del local storage)
  logout(): void {
    localStorage.removeItem("token");
  },

  // Función para guardar el token en el local storage
  saveToken(token: string): void {
    localStorage.setItem("token", token);
  },

  // Función para obtener el token del local storage
  getToken(): string | null {
    return localStorage.getItem("token");
  },
};

export default AuthService;
