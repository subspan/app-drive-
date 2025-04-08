# Supabase Setup for VapeRush

This directory contains the database schema and setup instructions for the VapeRush application using Supabase.

## Setting Up Supabase

1. Create a new Supabase project at [https://app.supabase.io](https://app.supabase.io)
2. Once your project is created, go to the SQL Editor in the Supabase dashboard
3. Copy the contents of `schema.sql` and paste it into the SQL Editor
4. Run the SQL script to create all necessary tables, policies, and functions

## Environment Variables

Make sure to set the following environment variables in your project:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

## Storage Buckets

The schema creates the following storage buckets:

- `avatars`: For user profile pictures
- `shop-images`: For shop logos and banners
- `product-images`: For product images
- `id-verification`: For ID verification documents (private bucket)

## Database Schema

### Tables

1. **profiles**: User profiles with personal information
2. **age_verifications**: Records of ID verification submissions
3. **shops**: CBD and vape shops information
4. **products**: Products offered by shops
5. **orders**: Customer orders
6. **order_items**: Individual items in orders
7. **drivers**: Driver information and verification

### Row Level Security (RLS)

The schema includes RLS policies to ensure data security:

- Users can only view and update their own profiles
- Users can only view their own orders and order items
- Shop owners can only update their own shops
- Drivers can only view orders assigned to them or available for pickup

## Authentication

The application uses Supabase Auth for user authentication. The schema is designed to work with Supabase Auth's user management system.

## Next Steps

After setting up the database, you'll need to:

1. Configure the storage buckets in the Supabase dashboard
2. Set up any additional authentication providers if needed
3. Create any necessary edge functions for complex operations