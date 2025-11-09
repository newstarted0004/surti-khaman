# સુરતી ખમણ - Shop Management System

A complete mobile-first web application for managing daily business operations of Surti Khaman shop. Built with Next.js, TypeScript, and Supabase.

## ✨ Features

### 📊 Daily Sales Management
- Add daily total sales amount
- View sales history
- Edit and delete sales entries
- Generate PDF bills

### 🛒 Material Purchase Management
- Manage shops (suppliers) with contact numbers
- Manage items with units (KG, Liter, etc.)
- Add purchase entries with:
  - Shop, item, quantity, amount
  - Purchase time and date
  - Total bill, paid amount, remaining amount
- Track payment settlements
- Generate PDF purchase bills
- Drag & drop reordering for shops and items

### 📦 Bulk Sales/Distribution Management
- Manage customers (shops/owners) with contact details
- Manage products list (editable)
- Add bulk sales with:
  - Customer, product, quantity (KG)
  - Price per KG
  - Total amount calculation
  - Payment tracking (paid/remaining)
- Generate PDF bills for customers
- Drag & drop reordering for customers and products

### 👥 Worker Management
- Add workers with contact numbers and per-day salary
- Mark attendance (present/absent)
- Track advance payments (અગાઉથી)
- Track salary payments
- Automatic salary calculation:
  - Total Salary = Present Days × Per Day Salary
  - Remaining = Total Salary - Advances - Payments
- Generate worker reports in PDF
- Drag & drop reordering for workers

### 📈 Analytics Dashboard
- Daily, Monthly, and Yearly views
- Total sales overview
- Purchase costs
- Bulk sales revenue
- Worker costs
- Net profit/loss calculation

### 🔒 Security
- PIN-based authentication (Default: 1813)
- Session-based login
- Protected routes

### 📱 Mobile-First Design
- Beautiful, simple UI in Gujarati
- Touch-friendly interface
- Responsive design
- Bottom navigation for easy access

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- GitHub account (for deployment)
- Vercel account (for hosting)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd surti-khaman
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run the SQL from `supabase-setup.sql` in SQL Editor
   - Copy your project URL and anon key

4. **Create environment file**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000` and login with PIN: **1813**

## 📖 Detailed Setup

See [SETUP.md](./SETUP.md) for comprehensive setup instructions including:
- Supabase database setup
- GitHub repository setup
- Vercel deployment
- Testing guidelines
- Troubleshooting

## 🗄️ Database Schema

The application uses the following main tables:
- `daily_sales` - Daily sales entries
- `shops` - Supplier shops
- `items` - Purchase items
- `material_purchases` - Purchase transactions
- `customers` - Bulk sale customers
- `products` - Products for bulk sales
- `bulk_sales` - Bulk sale transactions
- `workers` - Worker information
- `worker_attendance` - Attendance records
- `worker_advances` - Advance payments
- `worker_salary_payments` - Salary payments

See `supabase-setup.sql` for complete schema.

## 🎨 UI/UX Features

- **Gujarati Language**: Complete interface in Gujarati
- **Color Scheme**: Beautiful gradient colors (orange/primary theme)
- **Typography**: Noto Sans Gujarati font for proper Gujarati rendering
- **Mobile Navigation**: Bottom navigation bar for easy access
- **Drag & Drop**: Reorderable lists for shops, items, customers, products, and workers
- **PDF Generation**: Professional bill generation
- **Real-time Calculations**: Automatic calculations for totals, remaining amounts, etc.

## 🔧 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Custom components
- **Drag & Drop**: react-beautiful-dnd
- **PDF Generation**: jsPDF
- **Date Handling**: date-fns
- **Deployment**: Vercel

## 📝 Usage Guide

### Adding Daily Sales
1. Go to "વેચાણ" (Sales) tab
2. Enter date and total sales amount
3. Click "ઉમેરો" (Add)

### Managing Purchases
1. Go to "ખરીદી" (Purchases) tab
2. First, add shops and items in their respective tabs
3. Then add purchase entries with all details
4. Track payments and generate bills

### Managing Bulk Sales
1. Go to "બલ્ક વેચાણ" (Bulk Sales) tab
2. Add customers and products first
3. Add sales entries with quantity and price per KG
4. Track payments and generate bills

### Managing Workers
1. Go to "કામદાર" (Workers) tab
2. Add workers with per-day salary
3. Mark attendance daily
4. Add advance payments and salary payments
5. View calculated remaining amounts

### Viewing Analytics
1. Go to "ડેશબોર્ડ" (Dashboard)
2. Switch between Today, Month, and Year views
3. View all financial summaries

## 🔐 Security

- PIN authentication required on every session
- Default PIN: **1813** (change in `lib/auth.ts` for production)
- All data stored securely in Supabase
- Environment variables for sensitive keys

## 🚢 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

See [SETUP.md](./SETUP.md) for detailed deployment instructions.

## 📄 License

Private project for Surti Khaman shop.

## 👨‍💻 Development

### Project Structure
```
surti-khaman/
├── app/
│   ├── dashboard/       # Dashboard pages
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Login page
├── lib/
│   ├── auth.ts          # Authentication
│   ├── pdf.ts           # PDF generation
│   └── supabase.ts      # Supabase client
├── supabase-setup.sql   # Database schema
└── package.json         # Dependencies
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

See [SETUP.md](./SETUP.md) for troubleshooting guide.

## 📞 Support

For issues or questions, check:
1. Browser console for errors
2. Supabase logs
3. Vercel deployment logs

---

**Made with ❤️ for Surti Khaman Shop**

