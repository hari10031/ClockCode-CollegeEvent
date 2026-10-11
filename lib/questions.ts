import "server-only";
import { randomInt } from "node:crypto";

export type Question = { title: string; prompt: string; code: string; options: string[]; answer: number; explanation: string };

// Default seconds per clock slot (3, 6, 9, 12 o'clock). Organizer can change them on /admin.
export const LIMITS = [30, 30, 45, 60];

// SETS[set][slot]. Question id = set * 4 + slot.
export const SETS: Question[][] = [
  [
    {
      "title": "3 O'CLOCK — Predict the output",
      "prompt": "",
      "code": "x = 4\nprint(x ** 2 + 3)",
      "options": [
        "19",
        "28",
        "11",
        "16"
      ],
      "answer": 0,
      "explanation": "4² = 16, then 16 + 3 = 19."
    },
    {
      "title": "6 O'CLOCK — Debug the code",
      "prompt": "",
      "code": "for i in range(5)\n    print(i)",
      "options": [
        "Missing parentheses",
        "Missing colon",
        "Wrong variable",
        "No error"
      ],
      "answer": 1,
      "explanation": "A for-loop header must end with a colon."
    },
    {
      "title": "9 O'CLOCK — String logic",
      "prompt": "",
      "code": "s = \"level\"\nprint(s == s[::-1])",
      "options": [
        "level",
        "False",
        "True",
        "Error"
      ],
      "answer": 2,
      "explanation": "The reversed string is also 'level'."
    },
    {
      "title": "12 O'CLOCK — DSA concept",
      "prompt": "What is the typical time complexity of binary search on a sorted list?",
      "code": "",
      "options": [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n²)"
      ],
      "answer": 1,
      "explanation": "Each step halves the remaining search interval."
    }
  ],
  [
    {
      "title": "3 O'CLOCK — Loop output",
      "prompt": "",
      "code": "total = 0\nfor i in range(1, 4):\n    total += i\nprint(total)",
      "options": [
        "3",
        "4",
        "6",
        "10"
      ],
      "answer": 2,
      "explanation": "The loop adds 1 + 2 + 3."
    },
    {
      "title": "6 O'CLOCK — Dictionary behavior",
      "prompt": "",
      "code": "scores = {\"Ana\": 8, \"Ben\": 6}\nprint(scores.get(\"Sam\", 0))",
      "options": [
        "Sam",
        "None",
        "0",
        "KeyError"
      ],
      "answer": 2,
      "explanation": "get returns the default value 0 when the key is absent."
    },
    {
      "title": "9 O'CLOCK — Python concept",
      "prompt": "Which exception is raised by int('hello')?",
      "code": "",
      "options": [
        "TypeError",
        "ValueError",
        "IndexError",
        "KeyError"
      ],
      "answer": 1,
      "explanation": "The string is not a valid representation of an integer."
    },
    {
      "title": "12 O'CLOCK — Output prediction",
      "prompt": "",
      "code": "x = 1\nwhile x < 10:\n    x *= 2\nprint(x)",
      "options": [
        "8",
        "10",
        "16",
        "Infinite loop"
      ],
      "answer": 2,
      "explanation": "The value doubles until it reaches 16, when the condition becomes false."
    }
  ],
  [
    {
      "title": "3 O'CLOCK — List output",
      "prompt": "",
      "code": "a = [1, 2]\nb = a\nb.append(3)\nprint(a)",
      "options": [
        "[1, 2]",
        "[1, 2, 3]",
        "[3]",
        "Error"
      ],
      "answer": 1,
      "explanation": "Both names refer to the same list."
    },
    {
      "title": "6 O'CLOCK — Operator output",
      "prompt": "",
      "code": "print(17 // 5, 17 % 5)",
      "options": [
        "3 2",
        "2 3",
        "3.4 0",
        "2 2"
      ],
      "answer": 0,
      "explanation": "// gives the quotient 3 and % gives remainder 2."
    },
    {
      "title": "9 O'CLOCK — Find the bug",
      "prompt": "",
      "code": "password = \"abc123\"\nif len(password) = 6:\n    print(\"OK\")",
      "options": [
        "Use == instead of =",
        "Use append()",
        "Remove the colon",
        "No error"
      ],
      "answer": 0,
      "explanation": "Use == to compare values."
    },
    {
      "title": "12 O'CLOCK — Coding concept",
      "prompt": "What must a recursive function have to stop calling itself?",
      "code": "",
      "options": [
        "A dictionary",
        "A base case",
        "A class",
        "A set"
      ],
      "answer": 1,
      "explanation": "The base case ends the recursive calls."
    }
  ],
  [
    {
      "title": "3 O'CLOCK — String slicing",
      "prompt": "",
      "code": "s = \"coding\"\nprint(s[1:4])",
      "options": [
        "cod",
        "odi",
        "din",
        "odin"
      ],
      "answer": 1,
      "explanation": "The slice includes indices 1, 2, and 3."
    },
    {
      "title": "6 O'CLOCK — Exception handling",
      "prompt": "",
      "code": "try:\n    print(10 // 0)\nexcept ZeroDivisionError:\n    print(\"Cannot divide\")",
      "options": [
        "0",
        "Infinity",
        "Cannot divide",
        "Uncaught error"
      ],
      "answer": 2,
      "explanation": "The exception is caught by the except block."
    },
    {
      "title": "9 O'CLOCK — Set behavior",
      "prompt": "",
      "code": "items = [1, 2, 2, 3, 3, 3]\nprint(len(set(items)))",
      "options": [
        "6",
        "3",
        "2",
        "1"
      ],
      "answer": 1,
      "explanation": "A set stores only unique values."
    },
    {
      "title": "12 O'CLOCK — Algorithm output",
      "prompt": "",
      "code": "nums = [5, 1, 5, 3, 4]\nprint(sorted(set(nums))[-2])",
      "options": [
        "3",
        "4",
        "5",
        "1"
      ],
      "answer": 1,
      "explanation": "Sorted unique values are [1, 3, 4, 5], so the second largest is 4."
    }
  ],
  [
    {
      "title": "3 O'CLOCK — Boolean output",
      "prompt": "",
      "code": "print(bool([]), bool(\"0\"), bool(0))",
      "options": [
        "True False True",
        "False True False",
        "False False False",
        "True True False"
      ],
      "answer": 1,
      "explanation": "Empty list and numeric zero are false; a non-empty string is true."
    },
    {
      "title": "6 O'CLOCK — List indexing",
      "prompt": "",
      "code": "values = [10, 20, 30]\nprint(values[3])",
      "options": [
        "30",
        "None",
        "IndexError",
        "0"
      ],
      "answer": 2,
      "explanation": "Valid indices are 0, 1, and 2."
    },
    {
      "title": "9 O'CLOCK — Function output",
      "prompt": "",
      "code": "def double(x):\n    return x * 2\nprint(double(6) + 1)",
      "options": [
        "12",
        "13",
        "7",
        "36"
      ],
      "answer": 1,
      "explanation": "double(6) returns 12, then 1 is added."
    },
    {
      "title": "12 O'CLOCK — Logic output",
      "prompt": "",
      "code": "for n in range(1, 6):\n    if n % 2 == 0:\n        print(\"A\", end=\"\")\n    else:\n        print(\"B\", end=\"\")",
      "options": [
        "ABABA",
        "BABAB",
        "AABBB",
        "BBBBB"
      ],
      "answer": 1,
      "explanation": "Odd values print B and even values print A."
    }
  ],
  [
    {
      "title": "3 O'CLOCK — Dictionary output",
      "prompt": "",
      "code": "person = {\"name\": \"Ravi\"}\nprint(person.get(\"age\", \"Unknown\"))",
      "options": [
        "age",
        "None",
        "Unknown",
        "KeyError"
      ],
      "answer": 2,
      "explanation": "The missing key returns the supplied default."
    },
    {
      "title": "6 O'CLOCK — Loop range",
      "prompt": "",
      "code": "for i in range(2, 11, 3):\n    print(i, end=\" \")",
      "options": [
        "2 5 8",
        "2 5 8 11",
        "3 6 9",
        "2 3 4 5"
      ],
      "answer": 0,
      "explanation": "The range stops before 11."
    },
    {
      "title": "9 O'CLOCK — Debugging input",
      "prompt": "",
      "code": "age = input(\"Age: \")\nprint(age + 1)",
      "options": [
        "Always works",
        "Convert age to int first",
        "Convert 1 to a string",
        "Use len(age)"
      ],
      "answer": 1,
      "explanation": "input returns a string; convert it to int before adding."
    },
    {
      "title": "12 O'CLOCK — Recursion output",
      "prompt": "",
      "code": "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\nprint(factorial(5))",
      "options": [
        "25",
        "60",
        "120",
        "15"
      ],
      "answer": 2,
      "explanation": "5 × 4 × 3 × 2 × 1 equals 120."
    }
  ],
  [
    {
      "title": "3 O'CLOCK — Output prediction",
      "prompt": "",
      "code": "nums = [8, 3, 6]\nprint(min(nums) + max(nums))",
      "options": [
        "9",
        "11",
        "14",
        "17"
      ],
      "answer": 1,
      "explanation": "The minimum 3 plus maximum 8 equals 11."
    },
    {
      "title": "6 O'CLOCK — Comprehension output",
      "prompt": "",
      "code": "print([x*x for x in range(4) if x % 2 == 0])",
      "options": [
        "[0, 1, 4, 9]",
        "[0, 4]",
        "[1, 9]",
        "[2, 4]"
      ],
      "answer": 1,
      "explanation": "Only even values 0 and 2 are squared."
    },
    {
      "title": "9 O'CLOCK — Debug the loop",
      "prompt": "",
      "code": "items = [4, 5, 6]\nfor i in range(len(items) + 1):\n    print(items[i])",
      "options": [
        "Use range(len(items))",
        "Use range(len(items)-1)",
        "Convert to tuple",
        "No error"
      ],
      "answer": 0,
      "explanation": "The loop currently tries to access index 3."
    },
    {
      "title": "12 O'CLOCK — DSA concept",
      "prompt": "Which data structure follows LIFO (last in, first out)?",
      "code": "",
      "options": [
        "Queue",
        "Stack",
        "Tree",
        "Graph"
      ],
      "answer": 1,
      "explanation": "A stack removes the most recently added item first."
    }
  ],
  [
    {
      "title": "3 O'CLOCK — Output prediction",
      "prompt": "",
      "code": "name = \" Python Fun \"\nprint(name.strip().lower())",
      "options": [
        "' python fun '",
        "'Python Fun'",
        "'python fun'",
        "Error"
      ],
      "answer": 2,
      "explanation": "strip removes outer spaces and lower changes case."
    },
    {
      "title": "6 O'CLOCK — Set logic",
      "prompt": "",
      "code": "print(len(set(\"banana\")))",
      "options": [
        "3",
        "6",
        "4",
        "2"
      ],
      "answer": 0,
      "explanation": "Unique characters are b, a, and n."
    },
    {
      "title": "9 O'CLOCK — Function concept",
      "prompt": "",
      "code": "def greet(name, greeting=\"Hi\"):\n    print(greeting, name)\ngreet(\"Mira\")",
      "options": [
        "Mira Hi",
        "Hi Mira",
        "Hi",
        "Error"
      ],
      "answer": 1,
      "explanation": "The default value for greeting is 'Hi'."
    },
    {
      "title": "12 O'CLOCK — Debugging logic",
      "prompt": "",
      "code": "def is_positive(n):\n    if n < 0:\n        return True\n    return False",
      "options": [
        "Change n < 0 to n > 0",
        "Add a dictionary",
        "Remove return",
        "No change needed"
      ],
      "answer": 0,
      "explanation": "The current condition returns True for negative numbers."
    }
  ],
  [
    {
      "title": "3 O'CLOCK — Output prediction",
      "prompt": "",
      "code": "x = [1, 2, 3]\nprint(x == x[:], x is x[:])",
      "options": [
        "False False",
        "True True",
        "True False",
        "False True"
      ],
      "answer": 2,
      "explanation": "The lists have equal contents but are different objects."
    },
    {
      "title": "6 O'CLOCK — Python basics",
      "prompt": "What does len({'a': 1, 'b': 2, 'c': 3}) return?",
      "code": "",
      "options": [
        "1",
        "2",
        "3",
        "6"
      ],
      "answer": 2,
      "explanation": "len on a dictionary returns the number of keys."
    },
    {
      "title": "9 O'CLOCK — Output prediction",
      "prompt": "",
      "code": "text = \"banana\"\ncounts = {}\nfor ch in text:\n    counts[ch] = counts.get(ch, 0) + 1\nprint(counts[\"a\"], counts[\"n\"])",
      "options": [
        "2 3",
        "3 2",
        "1 2",
        "3 3"
      ],
      "answer": 1,
      "explanation": "There are three a's and two n's."
    },
    {
      "title": "12 O'CLOCK — Algorithm concept",
      "prompt": "What is the typical average time complexity of checking membership in a Python set?",
      "code": "",
      "options": [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n²)"
      ],
      "answer": 0,
      "explanation": "Set membership is O(1) on average."
    }
  ],
  [
    {
      "title": "3 O'CLOCK — Output prediction",
      "prompt": "",
      "code": "squares = {n: n*n for n in range(1, 4)}\nprint(squares[3])",
      "options": [
        "3",
        "6",
        "9",
        "KeyError"
      ],
      "answer": 2,
      "explanation": "The key 3 maps to 3 × 3 = 9."
    },
    {
      "title": "6 O'CLOCK — Output prediction",
      "prompt": "",
      "code": "print(\"Hi\" * 3)",
      "options": [
        "Hi3",
        "Hi Hi Hi",
        "HiHiHi",
        "Error"
      ],
      "answer": 2,
      "explanation": "String multiplication repeats the string."
    },
    {
      "title": "9 O'CLOCK — Debugging",
      "prompt": "",
      "code": "squares = [x for x in range(1, 6) if x * x]\nprint(squares)",
      "options": [
        "[1, 4, 9, 16, 25]",
        "[1, 2, 3, 4, 5]",
        "[0]",
        "[]"
      ],
      "answer": 1,
      "explanation": "The expression stores x; the condition is true for all values 1 through 5."
    },
    {
      "title": "12 O'CLOCK — Two-sum reasoning",
      "prompt": "For nums = [2, 7, 4] and target = 9, what should a correct two-sum check return?",
      "code": "",
      "options": [
        "False",
        "True",
        "9",
        "[2, 7, 4]"
      ],
      "answer": 1,
      "explanation": "2 + 7 equals 9, so a valid pair exists."
    }
  ]
];

export const byId = (id: number) => SETS[Math.floor(id / 4)][id % 4];

// limit = seconds for this question, or null when the timer is off.
export const publicQuestion = (id: number, index: number, limit: number | null) => {
  const { title, prompt, code, options } = byId(id);
  return { index, title, prompt, code, options, limit };
};

// Pick 4 question ids (one per clock slot) for a mode: "0".."9", "random-set" or "random-mix".
export function pick(mode: string): { ids: number[]; label: string } | null {
  if (mode === "random-mix")
    return { ids: [0, 1, 2, 3].map(slot => randomInt(SETS.length) * 4 + slot), label: "Random mix" };
  const random = mode === "random-set";
  const set = random ? randomInt(SETS.length) : Number(mode);
  if (mode === "" || !Number.isInteger(set) || set < 0 || set >= SETS.length) return null;
  return { ids: [0, 1, 2, 3].map(slot => set * 4 + slot), label: `Set ${set + 1}${random ? " (random)" : ""}` };
}
