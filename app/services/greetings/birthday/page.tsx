"use client"

import OccasionPageTemplate from "@/components/occasion-page-template"

export default function GreetingsBirthdayPage() {
  return (
    <OccasionPageTemplate
      category="greetings"
      categoryTitle="تهنئات"
      occasion="birthday"
      occasionTitle="عيد ميلاد"
      backHref="/services/greetings"
    />
  )
}
