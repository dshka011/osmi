// Преобразование Restaurant
import { Restaurant, MenuCategory, MenuItem } from '../types';

export function fromDbRestaurant(db: any): Restaurant {
  return {
    id: db.id,
    name: db.name,
    description: db.description,
    logo: db.logo,
    photo: db.photo,
    phone: db.phone,
    email: db.email,
    address: db.address,
    website: db.website,
    currency: db.currency,
    workingHours: db.working_hours,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

export function toDbRestaurant(restaurant: Partial<Restaurant> & { userId?: string }) {
  const db: any = { ...restaurant };
  if ('workingHours' in db) {
    db.working_hours = db.workingHours;
    delete db.workingHours;
  }
  if ('userId' in db) {
    db.user_id = db.userId;
    delete db.userId;
  }
  if ('createdAt' in db) {
    db.created_at = db.createdAt instanceof Date ? db.createdAt.toISOString() : db.createdAt;
    delete db.createdAt;
  }
  if ('updatedAt' in db) {
    db.updated_at = db.updatedAt instanceof Date ? db.updatedAt.toISOString() : db.updatedAt;
    delete db.updatedAt;
  }
  return db;
}

// Преобразование MenuCategory
export function fromDbCategory(db: any): MenuCategory {
  return {
    id: db.id,
    restaurantId: db.restaurant_id,
    name: db.name,
    description: db.description,
    position: db.position,
    isVisible: db.is_visible,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

export function toDbCategory(category: Partial<MenuCategory>) {
  const db: any = { ...category };
  if ('restaurantId' in db) {
    db.restaurant_id = db.restaurantId;
    delete db.restaurantId;
  }
  if ('isVisible' in db) {
    db.is_visible = db.isVisible;
    delete db.isVisible;
  }
  if ('createdAt' in db) {
    db.created_at = db.createdAt instanceof Date ? db.createdAt.toISOString() : db.createdAt;
    delete db.createdAt;
  }
  if ('updatedAt' in db) {
    db.updated_at = db.updatedAt instanceof Date ? db.updatedAt.toISOString() : db.updatedAt;
    delete db.updatedAt;
  }
  return db;
}

// Преобразование MenuItem
export function fromDbMenuItem(db: any): MenuItem {
  return {
    id: db.id,
    categoryId: db.category_id,
    name: db.name,
    description: db.description,
    price: db.price,
    image: db.image,
    tags: db.tags,
    isVisible: db.is_visible,
    position: db.position,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

export function toDbMenuItem(item: Partial<MenuItem>) {
  const db: any = { ...item };
  if ('categoryId' in db) {
    db.category_id = db.categoryId;
    delete db.categoryId;
  }
  if ('isVisible' in db) {
    db.is_visible = db.isVisible;
    delete db.isVisible;
  }
  if ('createdAt' in db) {
    db.created_at = db.createdAt instanceof Date ? db.createdAt.toISOString() : db.createdAt;
    delete db.createdAt;
  }
  if ('updatedAt' in db) {
    db.updated_at = db.updatedAt instanceof Date ? db.updatedAt.toISOString() : db.updatedAt;
    delete db.updatedAt;
  }
  return db;
} 