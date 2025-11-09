# સુરતી ખમણ - Setup Guide

## પૂર્વજરૂરીયાતો

1. Node.js (v18+)
2. npm અથવા yarn
3. Supabase એકાઉન્ટ
4. GitHub એકાઉન્ટ
5. Vercel એકાઉન્ટ

## Step 1: Supabase Setup

### 1.1 Supabase Project બનાવો

1. [supabase.com](https://supabase.com) પર જાઓ
2. નવો project બનાવો
3. Project નું નામ: `surti-khaman` (અથવા તમારી પસંદગી)
4. Database password નોંધી લો

### 1.2 Database Schema Setup

1. Supabase Dashboard માં જાઓ
2. **SQL Editor** પર ક્લિક કરો
3. `supabase-setup.sql` ફાઇલની સામગ્રી કૉપી કરો
4. SQL Editor માં paste કરો અને **Run** ક્લિક કરો
5. તમામ tables અને functions બનાવાયેલા હોવા જોઈએ

### 1.3 API Keys મેળવો

1. **Settings** → **API** પર જાઓ
2. **Project URL** નકલ કરો
3. **anon/public key** નકલ કરો

## Step 2: Local Development Setup

### 2.1 Dependencies Install કરો

```bash
npm install
```

### 2.2 Environment Variables Setup

`.env.local` ફાઇલ બનાવો (root directory માં):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**નોંધ:** `.env.local` ફાઇલ `.gitignore` માં છે, તેથી તે GitHub પર commit થશે નહીં.

### 2.3 Development Server ચલાવો

```bash
npm run dev
```

બ્રાઉઝરમાં `http://localhost:3000` પર જાઓ.

### 2.4 PIN Login

- Default PIN: **1813**

## Step 3: GitHub Setup

### 3.1 Repository બનાવો

1. GitHub પર નવું repository બનાવો
2. Repository નામ: `surti-khaman` (અથવા તમારી પસંદગી)

### 3.2 Code Push કરો

```bash
git init
git add .
git commit -m "Initial commit: Surti Khaman Shop Management System"
git branch -M main
git remote add origin https://github.com/your-username/surti-khaman.git
git push -u origin main
```

## Step 4: Vercel Deployment

### 4.1 Vercel પર Project Import કરો

1. [vercel.com](https://vercel.com) પર જાઓ
2. **Add New Project** ક્લિક કરો
3. GitHub repository પસંદ કરો
4. **Import** ક્લિક કરો

### 4.2 Environment Variables Add કરો

Vercel Dashboard માં:
1. **Settings** → **Environment Variables** પર જાઓ
2. નીચેની variables add કરો:
   - `NEXT_PUBLIC_SUPABASE_URL` = તમારો Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = તમારો Supabase anon key

### 4.3 Deploy કરો

1. **Deploy** બટન ક્લિક કરો
2. Deployment પૂર્ણ થયા પછી, તમને production URL મળશે

## Step 5: Testing

### 5.1 Features Test કરો

1. **PIN Login** - PIN: 1813
2. **Daily Sales** - વેચાણ ઉમેરો
3. **Purchases** - દુકાનો અને વસ્તુઓ ઉમેરો, ખરીદી entries બનાવો
4. **Bulk Sales** - ગ્રાહકો અને પ્રોડક્ટ્સ ઉમેરો, વેચાણ entries બનાવો
5. **Workers** - કામદારો ઉમેરો, હાજરી માર્ક કરો, અગાઉથી અને પગાર entries બનાવો
6. **Dashboard** - Analytics જુઓ
7. **PDF Generation** - બિલ્સ download કરો

### 5.2 Mobile Testing

1. Mobile browser માં production URL ખોલો
2. તમામ features mobile માં કામ કરે છે તે verify કરો
3. UI/UX mobile માં યોગ્ય છે તે check કરો

## Troubleshooting

### Database Connection Issues

- Supabase URL અને key યોગ્ય છે તે verify કરો
- Supabase project active છે તે check કરો
- Network connectivity check કરો

### Build Errors

- Node.js version 18+ છે તે verify કરો
- `npm install` ફરીથી run કરો
- `node_modules` delete કરીને ફરીથી install કરો

### PDF Generation Issues

- Browser console માં errors check કરો
- jsPDF library properly installed છે તે verify કરો

## Support

કોઈ પણ સમસ્યા હોય તો:
1. Error messages નકલ કરો
2. Browser console logs check કરો
3. Supabase logs check કરો

## Updates અને Maintenance

### Code Updates

```bash
git pull origin main
npm install
npm run build
```

### Database Updates

1. Supabase SQL Editor માં જાઓ
2. નવા queries run કરો
3. Migration scripts maintain કરો

## Security Notes

1. PIN authentication session-based છે
2. Production માં PIN change કરવાની સલાહ આપવામાં આવે છે
3. Supabase RLS (Row Level Security) enable કરી શકાય છે જો જરૂરી હોય
4. Environment variables ક્યારેય commit કરશો નહીં

## Performance Tips

1. Supabase indexes already setup છે
2. Large datasets માટે pagination add કરી શકાય છે
3. Caching strategies implement કરી શકાય છે

---

**Happy Coding! 🎉**

