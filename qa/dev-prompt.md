# DEV agent run (Mansalvic)
You are the developer agent for the Mansalvic app (client/ is Vite + React).
1. Read communications.txt: the newest QA ROUND section and any REOPENED or
   new QA-### / DES-### items. Ignore items already VERIFIED.
2. Fix them in the code. Keep changes minimal and focused.
3. Make sure the Vite dev server on http://localhost:3000 serves the new code
   (restart it from client/ with `npm run dev` if needed).
4. Under DEV RESPONSES, append one line per item:
   QA-### | FIXED / WONTFIX / NEED-INFO | files | note
5. Final line, on its own line, starting at column 1:
   READY FOR QA ROUND <n>      (n = previous QA round + 1)
   Append only. Then stop.
