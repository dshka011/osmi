import { PostgrestError } from '@supabase/supabase-js';

export interface AppError {
  type: 'network' | 'validation' | 'auth' | 'database' | 'file' | 'unknown';
  title: string;
  message: string;
  originalError?: any;
}

export class ErrorHandler {
  static handleSupabaseError(error: PostgrestError | Error): AppError {
    if ('code' in error) {
      // Supabase PostgrestError
      const pgError = error as PostgrestError;
      
      switch (pgError.code) {
        case 'PGRST116':
          return {
            type: 'auth',
            title: 'Ошибка аутентификации',
            message: 'Не удалось выполнить операцию. Пожалуйста, войдите в систему снова.',
            originalError: error
          };
        case '23505': // unique_violation
          return {
            type: 'validation',
            title: 'Дублирование данных',
            message: 'Запись с такими данными уже существует.',
            originalError: error
          };
        case '23503': // foreign_key_violation
          return {
            type: 'validation',
            title: 'Ошибка связей',
            message: 'Нельзя удалить запись, которая используется в других местах.',
            originalError: error
          };
        case '42P01': // undefined_table
          return {
            type: 'database',
            title: 'Ошибка базы данных',
            message: 'Проблема с структурой базы данных. Обратитесь к администратору.',
            originalError: error
          };
        default:
          return {
            type: 'database',
            title: 'Ошибка базы данных',
            message: pgError.message || 'Произошла неизвестная ошибка при работе с базой данных.',
            originalError: error
          };
      }
    } else {
      // Обычная ошибка
      return this.handleGenericError(error);
    }
  }

  static handleNetworkError(error: any): AppError {
    if (error.message?.includes('fetch')) {
      return {
        type: 'network',
        title: 'Ошибка сети',
        message: 'Не удалось подключиться к серверу. Проверьте интернет-соединение.',
        originalError: error
      };
    }
    
    if (error.message?.includes('timeout')) {
      return {
        type: 'network',
        title: 'Превышено время ожидания',
        message: 'Запрос выполняется слишком долго. Попробуйте еще раз.',
        originalError: error
      };
    }

    return this.handleGenericError(error);
  }

  static handleFileError(error: any): AppError {
    if (error.message?.includes('file size')) {
      return {
        type: 'file',
        title: 'Файл слишком большой',
        message: 'Размер файла превышает допустимый лимит (5 МБ).',
        originalError: error
      };
    }

    if (error.message?.includes('file type')) {
      return {
        type: 'file',
        title: 'Неподдерживаемый формат',
        message: 'Поддерживаются только изображения в форматах JPG, PNG, GIF.',
        originalError: error
      };
    }

    return {
      type: 'file',
      title: 'Ошибка загрузки файла',
      message: 'Не удалось загрузить файл. Попробуйте еще раз.',
      originalError: error
    };
  }

  static handleValidationError(error: any): AppError {
    return {
      type: 'validation',
      title: 'Ошибка валидации',
      message: error.message || 'Проверьте правильность введенных данных.',
      originalError: error
    };
  }

  static handleAuthError(error: any): AppError {
    if (error.message?.includes('Invalid login credentials')) {
      return {
        type: 'auth',
        title: 'Неверные данные для входа',
        message: 'Проверьте email и пароль.',
        originalError: error
      };
    }

    if (error.message?.includes('Email not confirmed')) {
      return {
        type: 'auth',
        title: 'Email не подтвержден',
        message: 'Пожалуйста, подтвердите ваш email адрес.',
        originalError: error
      };
    }

    return {
      type: 'auth',
      title: 'Ошибка аутентификации',
      message: 'Произошла ошибка при входе в систему.',
      originalError: error
    };
  }

  static handleGenericError(error: any): AppError {
    console.error('Unhandled error:', error);
    
    return {
      type: 'unknown',
      title: 'Неизвестная ошибка',
      message: 'Произошла непредвиденная ошибка. Попробуйте обновить страницу.',
      originalError: error
    };
  }

  static handleError(error: any): AppError {
    // Определяем тип ошибки и обрабатываем соответственно
    if (error?.code) {
      return this.handleSupabaseError(error);
    }
    
    if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
      return this.handleNetworkError(error);
    }
    
    if (error?.message?.includes('file') || error?.message?.includes('upload')) {
      return this.handleFileError(error);
    }
    
    if (error?.message?.includes('validation') || error?.message?.includes('required')) {
      return this.handleValidationError(error);
    }
    
    if (error?.message?.includes('auth') || error?.message?.includes('login')) {
      return this.handleAuthError(error);
    }
    
    return this.handleGenericError(error);
  }
}

// Хук для обработки ошибок с уведомлениями
export const useErrorHandler = () => {
  const { showError } = require('../contexts/NotificationContext').useNotifications();
  
  const handleError = (error: any, customTitle?: string) => {
    const appError = ErrorHandler.handleError(error);
    
    showError(
      customTitle || appError.title,
      appError.message
    );
    
    return appError;
  };
  
  return { handleError };
}; 