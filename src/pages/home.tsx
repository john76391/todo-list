import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
// form
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// shadcn
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { Field } from "@/components/ui/field";
import {
  Item,
  ItemGroup,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Checkbox } from "@/components/ui/checkbox";

// 新增待辦事項表單
const formSchema = z.object({
  inputVal: z.string().min(1, "Input is required"),
});
type FormSchema = z.infer<typeof formSchema>;

// 狀態分頁
const tabs = ["All", "Active", "Done"] as const;
type Tabs = (typeof tabs)[number];

// 待辦事項
type Todo = {
  id: string;
  text: string;
  completed: boolean;
};
type TodoId = Todo["id"];

// localStorage key
const localTodoKey = "my-todo";

export default function Component() {
  const { control, handleSubmit, reset } = useForm<FormSchema>({
    defaultValues: {
      inputVal: "",
    },
    resolver: zodResolver(formSchema),
  });
  // _todo list
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem(localTodoKey);
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  // status tab
  const [activeTab, setActiveTab] = useState<Tabs>("All");
  // edit id
  const [editId, setEditId] = useState<TodoId | null>(null);
  // edit value
  const [editValue, setEditValue] = useState<string>("");

  // 選擇要編輯的 todo
  const startEdit = (id: TodoId, text: string) => {
    setEditId(id);
    setEditValue(text);
  };

  // _todo val change
  const onEditValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();

    setEditValue(val);
  };

  // 取消編輯
  const cancelEdit = () => setEditId(null);

  // 儲存編輯結果
  const saveEdit = (e: React.SubmitEvent<HTMLFormElement>) => {
    // stop default form submit action
    e.preventDefault();

    cancelEdit();

    // if edit value is empty, remove from todos
    if (editValue === "" && editId) return onRemoveTodo(editId);

    const nextState = todos.map((todo) => {
      if (todo.id === editId) return { ...todo, text: editValue };
      return todo;
    });

    setTodos(nextState);
  };

  // 根據 status tab 篩選出對應 todo list
  const filteredTodos = todos.filter((todo) => {
    if (activeTab === "Active") return !todo.completed;
    if (activeTab === "Done") return todo.completed;
    return true;
  });

  // add new task
  const onSubmit = (data: FormSchema) => {
    const newTodo = {
      id: uuidv4(),
      text: data.inputVal,
      completed: false,
    };

    setTodos((prev) => [newTodo, ...prev]);

    // reset form value
    reset();
  };

  // switch status tab
  const onSwitchTab = (tab: Tabs) => setActiveTab(tab);

  // task status change
  const onCheckChange = (id: TodoId) => {
    // 找出目標 element 的 index （用 slice 移除）
    const targetIndex = todos.findIndex((todo) => todo.id === id);
    // 保留目標 element，用來移到陣列最後
    const target = todos.find((todo) => todo.id === id);

    // 若沒有目標則停止執行
    if (!target) return;

    // 以目標為分界線拆成第一部分跟第二部分
    const firstPart = todos.slice(0, targetIndex);
    const secondPart = todos.slice(targetIndex + 1);

    // 完成則移到最後，反之移到最上面
    const newCombined = target.completed
      ? [
          { ...target, completed: !target?.completed },
          ...firstPart,
          ...secondPart,
        ]
      : [
          ...firstPart,
          ...secondPart,
          { ...target, completed: !target?.completed },
        ];

    setTodos(newCombined);
  };

  // remove todo
  const onRemoveTodo = (id: TodoId) =>
    setTodos((prev) => prev.filter((todo) => todo.id !== id));

  // set to localStorage every time todo state change
  useEffect(() => {
    localStorage.setItem(localTodoKey, JSON.stringify(todos));
  }, [todos]);

  return (
    <div className="min-h-screen px-4 py-8">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Todo List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* add new task */}
          <form className="mb-5 flex gap-3" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="inputVal"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    placeholder="Add Task...."
                    autoComplete="off"
                  />
                </Field>
              )}
            />

            <Button size="icon" type="submit" className="cursor-pointer">
              <Plus />
            </Button>
          </form>

          {/* tabs */}
          <div className="grid grid-cols-3 border-b-2 text-center">
            {tabs.map((tab) => (
              <div className="relative" key={tab}>
                <button
                  type="button"
                  className="mb-2 h-full w-full cursor-pointer"
                  onClick={() => onSwitchTab(tab)}
                >
                  {tab}

                  {activeTab === tab && (
                    <motion.div
                      layoutId="underline"
                      className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-indigo-500"
                    />
                  )}
                </button>
              </div>
            ))}
          </div>
          {/* todos */}
          <div className="pt-4">
            <ItemGroup className="" key={activeTab}>
              <AnimatePresence>
                {filteredTodos.map((todo) => (
                  <Todo
                    {...todo}
                    key={todo.id}
                    onCheckChange={onCheckChange}
                    onRemoveTodo={onRemoveTodo}
                    editId={editId}
                    editValue={editValue}
                    startEdit={startEdit}
                    onEditValueChange={onEditValueChange}
                    saveEdit={saveEdit}
                    cancelEdit={cancelEdit}
                  />
                ))}
              </AnimatePresence>
            </ItemGroup>

            {filteredTodos.length === 0 && (
              <motion.p
                transition={{
                  duration: 1,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                initial={{
                  y: 5,
                  opacity: 0,
                }}
                className="text-center"
              >
                No Tasks
              </motion.p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Todo({
  id,
  text,
  completed,
  onCheckChange,
  onRemoveTodo,
  editId,
  editValue,
  startEdit,
  onEditValueChange,
  saveEdit,
  cancelEdit,
}: Todo & {
  onCheckChange: (id: TodoId) => void;
  onRemoveTodo: (id: TodoId) => void;
  editId: string | null;
  editValue: string;
  startEdit: (id: TodoId, text: string) => void;
  onEditValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveEdit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  cancelEdit: () => void;
}) {
  return (
    <motion.div
      transition={{
        duration: 1,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
      initial={{
        y: 5,
        opacity: 0,
      }}
      exit={{
        x: 10,
        opacity: 0,
        transition: {
          duration: 0.5,
        },
      }}
    >
      {editId === id ? (
        <form action="" className="" onSubmit={saveEdit}>
          <Item className="hover:bg-muted transition-colors duration-200">
            <ItemContent>
              <Input value={editValue} onChange={onEditValueChange} />
            </ItemContent>
            <ItemActions>
              <Button
                size="icon"
                variant="outline"
                className="cursor-pointer bg-emerald-500 text-white hover:bg-emerald-500/90 hover:text-white"
              >
                <Check />
              </Button>
              <Button
                onClick={cancelEdit}
                type="button"
                size="icon"
                variant="destructive"
                className="cursor-pointer"
              >
                <X />
              </Button>
            </ItemActions>
          </Item>
        </form>
      ) : (
        <Item className="hover:bg-muted transition-colors duration-200">
          <ItemMedia variant="icon">
            <Checkbox
              className="cursor-pointer opacity-50"
              checked={completed}
              onCheckedChange={() => onCheckChange(id)}
            />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className={cn(completed && "line-through opacity-50")}>
              {text}
            </ItemTitle>
          </ItemContent>
          <ItemActions>
            <Button
              onClick={() => startEdit(id, text)}
              size="icon"
              variant="outline"
              className="cursor-pointer"
            >
              <Pencil />
            </Button>
            <Button
              onClick={() => onRemoveTodo(id)}
              type="button"
              size="icon"
              variant="destructive"
              className="cursor-pointer"
            >
              <Trash2 />
            </Button>
          </ItemActions>
        </Item>
      )}
    </motion.div>
  );
}
