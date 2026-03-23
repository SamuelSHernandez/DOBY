import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    message: "Database schema already configured via direct SQL. Tables: property, mortgage, appreciation, insurance, rooms, inventory_items, wishlist_items, systems, expenses, utilities, projects, seasonal_tasks, custom_tasks, emergency_info, contractors, documents.",
  });
}
