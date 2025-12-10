"use client"

import OccasionPageTemplate from "@/components/occasion-page-template"

export default function GreetingsRamadanPage() {
  return (
    <OccasionPageTemplate
      category="greetings"
      categoryTitle="تهنئات"
      occasion="ramadan"
      occasionTitle="رمضان"
      backHref="/services/greetings"
    />
  )
}
