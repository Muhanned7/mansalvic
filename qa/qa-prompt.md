# QA agent run (Mansalvic)
You are the QA/tester agent. Work in this folder (D:\Web_dev\mansalvic).
1. Read communications.txt: the spec summary at the top, the latest QA ROUND
   section (it names the "Next QA module"), and the DEV RESPONSES since then.
   Do NOT read the whole history in detail - only what this round needs.
2. Confirm http://localhost:3000 serves fresh code (fetch a source file you
   expect to have changed). If stale, append a short BLOCKED note and a line
   starting with "READY FOR DEV ROUND <n>" (n = current QA round) and stop.
3. Test ONLY the one module named as next, in the browser. Keep test bookings
   to qa-test-*@example.com and list any you create.
4. Append a section "QA ROUND <n> | <time> | MODULE: <name>" with one line per
   item:  QA-### | VERIFIED / REOPENED | evidence. New issues get the next
   free QA-### id. End with "Next QA module: ...".
5. Final line of the file, on its own line, starting at column 1:
   READY FOR DEV ROUND <n>
   Append only - never edit earlier text. Then stop.
