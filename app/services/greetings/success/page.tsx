"use client"

import OccasionPageTemplate from "@/components/occasion-page-template"

export default function GreetingsSuccessPage() {
  return (
    <OccasionPageTemplate
      category="greetings"
      categoryTitle="تهنئات"
      occasion="success"
      occasionTitle="نجاح"
      backHref="/services/greetings"
    />
  )
}
