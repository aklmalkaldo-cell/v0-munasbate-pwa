"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TopHeader } from "@/components/top-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, DollarSign, CheckCircle2 } from "lucide-react"

interface Task {
  id: string
  title: string
  is_completed: boolean
}

interface Expense {
  id: string
  item_name: string
  amount: number
}

export default function PlannerPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [totalBudget, setTotalBudget] = useState("")
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [newExpenseItem, setNewExpenseItem] = useState("")
  const [newExpenseAmount, setNewExpenseAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem("user_id")
    const isGuest = localStorage.getItem("is_guest") === "true"

    if (!userId) {
      router.push("/")
      return
    }

    if (isGuest) {
      // الزوار يمكنهم استخدام المخطط لكن البيانات لن تُحفظ
      setIsLoading(false)
      return
    }

    // تحميل البيانات من localStorage
    const savedTasks = localStorage.getItem(`planner_tasks_${userId}`)
    const savedBudget = localStorage.getItem(`planner_budget_${userId}`)
    const savedExpenses = localStorage.getItem(`planner_expenses_${userId}`)

    if (savedTasks) setTasks(JSON.parse(savedTasks))
    if (savedBudget) setTotalBudget(savedBudget)
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses))

    setIsLoading(false)
  }, [router])

  const saveTasks = (newTasks: Task[]) => {
    const userId = localStorage.getItem("user_id")
    if (userId) {
      localStorage.setItem(`planner_tasks_${userId}`, JSON.stringify(newTasks))
    }
    setTasks(newTasks)
  }

  const saveExpenses = (newExpenses: Expense[]) => {
    const userId = localStorage.getItem("user_id")
    if (userId) {
      localStorage.setItem(`planner_expenses_${userId}`, JSON.stringify(newExpenses))
    }
    setExpenses(newExpenses)
  }

  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      is_completed: false,
    }

    saveTasks([...tasks, task])
    setNewTask("")
  }

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, is_completed: !task.is_completed } : task,
    )
    saveTasks(updatedTasks)
  }

  const deleteTask = (taskId: string) => {
    saveTasks(tasks.filter((task) => task.id !== taskId))
  }

  const saveBudget = () => {
    const userId = localStorage.getItem("user_id")
    if (userId && totalBudget) {
      localStorage.setItem(`planner_budget_${userId}`, totalBudget)
      alert("تم حفظ الميزانية بنجاح")
    }
  }

  const addExpense = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExpenseItem.trim() || !newExpenseAmount || !totalBudget) return

    const expense: Expense = {
      id: Date.now().toString(),
      item_name: newExpenseItem,
      amount: Number.parseFloat(newExpenseAmount),
    }

    saveExpenses([...expenses, expense])
    setNewExpenseItem("")
    setNewExpenseAmount("")
  }

  const deleteExpense = (expenseId: string) => {
    saveExpenses(expenses.filter((expense) => expense.id !== expenseId))
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const remainingBudget = (Number.parseFloat(totalBudget) || 0) - totalExpenses

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5E9E8] flex items-center justify-center">
        <p className="text-[#B38C8A]">جاري التحميل...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5E9E8] pb-20">
      <TopHeader />

      <main className="pt-20 px-4 max-w-screen-xl mx-auto pb-6">
        <h1 className="text-2xl font-bold text-[#B38C8A] mb-6">مخطط مناسبتي</h1>

        {/* قسم المهام */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#B38C8A] mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
            قائمة المهام
          </h2>

          <form onSubmit={addTask} className="mb-4">
            <div className="flex gap-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="أضف مهمة جديدة..."
                className="flex-1 border-[#B38C8A]/20 bg-white"
              />
              <Button type="submit" size="icon" className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </form>

          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F5E9E8]/50 transition-colors"
                >
                  <Checkbox
                    checked={task.is_completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="border-[#D4AF37] data-[state=checked]:bg-[#D4AF37]"
                  />
                  <span className={`flex-1 text-[#B38C8A] ${task.is_completed ? "line-through opacity-50" : ""}`}>
                    {task.title}
                  </span>
                  <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#B38C8A]/70 text-sm">لا توجد مهام بعد. ابدأ بإضافة مهامك!</p>
            </div>
          )}
        </div>

        {/* قسم الميزانية */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#B38C8A] mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#D4AF37]" />
            مدير الميزانية
          </h2>

          {/* إجمالي الميزانية */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#B38C8A] mb-2">الميزانية الإجمالية (ريال)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                placeholder="0"
                className="flex-1 border-[#B38C8A]/20 bg-white"
              />
              <Button onClick={saveBudget} className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                حفظ
              </Button>
            </div>
          </div>

          {/* إضافة مصروف */}
          {totalBudget && (
            <>
              <form onSubmit={addExpense} className="mb-4">
                <label className="block text-sm font-medium text-[#B38C8A] mb-2">إضافة مصروف جديد</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newExpenseItem}
                    onChange={(e) => setNewExpenseItem(e.target.value)}
                    placeholder="بند الصرف (مثال: فستان الزفاف)"
                    className="flex-1 border-[#B38C8A]/20 bg-white"
                  />
                  <Input
                    type="number"
                    value={newExpenseAmount}
                    onChange={(e) => setNewExpenseAmount(e.target.value)}
                    placeholder="المبلغ"
                    className="w-32 border-[#B38C8A]/20 bg-white"
                  />
                  <Button type="submit" size="icon" className="bg-[#D4AF37] hover:bg-[#B8941F] text-white">
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </form>

              {/* قائمة المصروفات */}
              {expenses.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-[#F5E9E8]/50">
                      <span className="text-[#B38C8A]">{expense.item_name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#B38C8A] font-medium">
                          {expense.amount.toLocaleString("ar-SA")} ريال
                        </span>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 mb-4">
                  <p className="text-[#B38C8A]/70 text-sm">لم تضف أي مصروفات بعد</p>
                </div>
              )}

              {/* الملخص المالي */}
              <div className="border-t border-[#B38C8A]/20 pt-4 space-y-2">
                <div className="flex justify-between text-[#B38C8A]">
                  <span>إجمالي الميزانية:</span>
                  <span className="font-medium">
                    {Number.parseFloat(totalBudget || "0").toLocaleString("ar-SA")} ريال
                  </span>
                </div>
                <div className="flex justify-between text-[#B38C8A]">
                  <span>إجمالي المصروفات:</span>
                  <span className="font-medium">{totalExpenses.toLocaleString("ar-SA")} ريال</span>
                </div>
                <div
                  className={`flex justify-between text-lg font-bold ${
                    remainingBudget >= 0 ? "text-[#D4AF37]" : "text-red-500"
                  }`}
                >
                  <span>المبلغ المتبقي:</span>
                  <span>{remainingBudget.toLocaleString("ar-SA")} ريال</span>
                </div>
                {remainingBudget < 0 && (
                  <p className="text-xs text-red-500 text-center">تحذير: تجاوزت الميزانية المحددة</p>
                )}
              </div>
            </>
          )}

          {!totalBudget && (
            <div className="text-center py-6">
              <p className="text-[#B38C8A]/70 text-sm">قم بتحديد الميزانية الإجمالية أولاً لبدء تتبع المصروفات</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
