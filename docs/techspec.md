# 🧾 Boutique Website – Technical Specification

---

## 1. 📌 Project Overview
A responsive boutique website with:
- 👤 Customer Panel
- 🔐 Admin Panel

### Phase 1:
- Service showcase
- Enquiry system

### Future Scope:
- Full E-commerce (Cart, Payment, Orders)

---

## 2. 🏗️ System Architecture
Client → Next.js → Node.js API → Database

- Development → SQLite  
- Production → PostgreSQL (Supabase)

---

## 3. 🖥️ Technology Stack

### Frontend
- Next.js (React)
- Tailwind CSS

### Backend
- Node.js (Express)

### Database
- SQLite (Development)
- PostgreSQL (Production)

### ORM
- Prisma

### Authentication
- JWT + OTP (Email)

---

## 4. 👤 Customer Panel Features

### 🏠 Home Page (Premium Layout)

#### 🔝 Top Section
- Auto image slider
- Displays multiple service images
- Service name overlay
- Auto slide (3–5 sec)

#### 🧩 Middle Section
- Service gallery grid
- Each card:
  - Image
  - Name
  - Price
  - Short description
  - View Details button

#### 📖 Bottom Section
- About preview (short description)
- “Know More” button → About page

---

### 🛍️ Services Page
- Responsive grid layout
- Same card structure

---

### 📄 Service Details Page

#### 🔝 Top
- Image slider (auto)

#### 🧩 Below
- Image gallery grid (all images visible)

#### 📋 Info
- Full description
- Price

#### 🔘 Actions
- Enquiry form
- Instagram DM

---

### 📩 Enquiry System
- Fields: Name, Address, Pincode, Mobile
- Auto-fill for logged-in users

---

### 📞 Contact Page
- Contact form
- Business details
- Instagram link

---

### 👤 Authentication
- Email + Password
- OTP verification

---

### 📌 Footer
- Logo
- Quick links (Home, Services, About, Contact)
- Contact information
- Social media links

---

## 5. 🔐 Admin Panel

- Dashboard (stats)
- Service management (CRUD)
- Multiple image upload
- Primary image selection
- Enquiry management

---

## 6. 🗄️ Database Schema

### Users
- id, name, email, password, mobile, address, pincode, is_verified, created_at

### Services
- id, name, description, price, created_at

### Service Images
- id, service_id, image_url, is_primary, created_at

### Enquiries
- id, user_id, service_id, name, address, pincode, mobile, created_at

### Admin
- id, email, password, otp_verified

---

## 7. 🔗 API Endpoints

### Auth
- POST /api/register
- POST /api/login
- POST /api/verify-otp

### Services
- GET /api/services
- GET /api/services/:id
- POST /api/admin/services
- PUT /api/admin/services/:id
- DELETE /api/admin/services/:id

### Enquiry
- POST /api/enquiry
- GET /api/admin/enquiries

---

## 8. 🔐 Security Implementation

- JWT authentication
- Password hashing (bcrypt)
- Input validation
- Rate limiting
- CSRF protection
- HTTPS enforcement

---

## 9. 🎨 UI/UX Design (IMPORTANT)

### Theme
Feminine + Luxury

### Color Palette
- Pink (#F8C8DC)
- Rose (#E75480)
- Gold (#D4AF37)
- White (#FFFFFF)
- Text: Dark Grey (#333333)

### Typography
- Headings: Elegant serif (Playfair Display)
- Body: Clean sans-serif (Poppins)

### Design Style
- Rounded corners
- Soft shadows
- Smooth hover animations
- Mobile-first responsive design

---

## 10. 🔍 SEO Strategy

- Server-side rendering (Next.js)
- Meta tags (title, description)
- Clean URLs
- Image alt text
- Fast loading

---

## 11. 🖼️ Image Handling

### Rules
- Max size: 500KB (recommended)
- Max allowed: 1MB
- Formats: JPG, PNG
- Stored as: WebP

### Processing
- Resize (800px width)
- Compress (80%)
- Remove metadata

### Multiple Images
- Each service supports multiple images
- Stored separately
- Displayed as:
  - Slider (top)
  - Gallery grid (below)
- First image used as primary

---

## 12. ☁️ Deployment

- Frontend → Vercel
- Backend → Render
- Database → Supabase

---

## 13. 🔐 Environment Variables

DATABASE_URL  
JWT_SECRET  
EMAIL_USER  
EMAIL_PASS  
INSTAGRAM_URL  
NODE_ENV  

---

## 14. 🧪 Development Strategy

- Development → SQLite  
- Production → PostgreSQL  
- ORM handles switching via environment variables  

---

## 15. 🧪 Testing Strategy (CORRECTED 🔥)

- Testing code MUST NOT be mixed with main application code  
- All test cases should be written in a separate folder (e.g., `/tests`)  

### Testing Types
- Functional testing
- API testing
- UI testing
- Security testing
- Performance testing

### Tools
- Jest
- Supertest
- Postman

---

## 16. 🚀 Future Enhancements

- Cart system
- Payment integration
- Order tracking
- Wishlist
- Reviews & ratings

---

## 🎯 Final

- Secure architecture  
- SEO optimized  
- Mobile responsive  
- Scalable system  
- Clean testing separation  
- Ready for production and future upgrades  