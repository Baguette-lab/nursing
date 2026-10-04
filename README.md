# Pathwise — Interactive Nursing Mastery

Complete website source for shock, anemia, thyroid disorders, seizures, and HIV/AIDS. Runs locally in VS Code and on GitHub Pages without a backend, API key, or dependency installation.

## Run it in VS Code

1. Extract the ZIP. Open the **Pathwise-Interactive-Full-Code** folder in VS Code.
2. Install Node.js 18 or later if it is not already installed.
3. Open **Terminal → New Terminal**. Make sure you are in the folder containing `package.json`.
4. Run:

   ```sh
   npm start
   ```

   You can also run `node server.mjs`. There is no need to run `npm install`.

5. Open **http://localhost:5500** in your browser. Keep the terminal open while studying; press **Ctrl+C** to stop the server.
6. Select a lesson and choose **Visual Lab** to interact with its diagrams. Read the Review, practice Flashcards, and complete Mastery before taking the topic quiz.

If port 5500 is busy, stop the other local server. Do not open `index.html` directly by double-clicking; the JavaScript modules need a local HTTP server.

## Upload to GitHub Pages

1. Open your GitHub repository and select **Add file → Upload files**.
2. Upload the **contents inside** the extracted folder. `index.html`, `app.mjs`, the other modules, and the `sources` folder must be at the repository root. Preserve the subfolders and relative filenames. The ZIP itself is not the website.
3. Commit the uploaded files to your `main` branch.
4. Go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select **main** and **/(root)**, and save.
5. Wait for GitHub Pages to finish publishing, then open the URL shown there.

For an existing Pages website, replace the old website files with these files and commit. Keep the existing branch/folder configuration if it already serves the repository root. GitHub Pages serves the HTML/CSS/JavaScript directly; it does not run `server.mjs`.

## What is included

- 32 lessons with detailed explanations, source-slide links, and clickable cause-and-effect maps. Select a step to see what happens and a memorization cue.
- **Shock:** change heart rate and stroke volume to calculate cardiac output, adjust systolic/diastolic pressure to estimate MAP, and compare the mechanisms behind the shock types.
- **Anemia:** compare symbolic cell patterns, production and survival, and how changing hemoglobin changes relative oxygen-carrying capacity.
- **Thyroid:** explore primary and central thyroid patterns, hormone feedback, symptoms, and treatment targets.
- **Seizures:** choose a seizure type and advance through its phases with brain and muscle-pattern schematics. The diagrams do not flash.
- **HIV:** step through replication, explore where drug classes act, and compare the direction of viral-load and CD4 changes with effective treatment.
- 192 memorization flashcards with direct prompts and precise answers. Flip to recall a fact, then mark Remembered or Forgot it; forgotten cards repeat. Supporting detail is optional.
- 192 relevant questions with explanations. Review unlocks each lesson's three-question mastery round; 3/3 completes mastery. All lessons in a topic unlock a 15-question quiz, and 12/15 (80%) unlocks the next topic.
- A failed topic quiz directs the learner to review and remaster missed lessons. Completing all five topics unlocks mixed exams of 10, 20, 30, or 50 questions.
- Browser-local progress and unfinished attempts. Progress stays in that browser and website address; it does not sync between GitHub Pages, localhost, and other devices.
- The five original lesson slide PDFs in `sources/`.

Numerical formulas are shown explicitly. Qualitative diagrams are labeled as simplified teaching models: symbolic cells are not blood-smear measurements, muscle traces are not EEG recordings, and HIV treatment curves do not predict an individual's timeline. Content is for learning, not clinical prescribing.

## Files to edit

| File | Purpose |
| --- | --- |
| `index.html` | Entry page and stylesheet links |
| `style.css` | Main website layout and theme |
| `app.mjs` | Screens, navigation, event handlers, and study flow |
| `engine.mjs` | Progress, gating, quiz scoring, and exam logic |
| `data.mjs` and `course.mjs` | Course assembly and shock lessons |
| `anemia.mjs`, `thyroid.mjs`, `seizures.mjs`, `hiv.mjs` | Topic lessons and questions |
| `flashcards.mjs` | Memorization prompts, answers, and supporting detail |
| `visual-models.mjs` | Calculator formulas, simplified model states, and control limits |
| `visual-notes.mjs` | Explanations and memory cues for each lesson map |
| `visuals.mjs` | Interactive diagram, control, and map rendering |
| `visuals.css` | Visual Lab styling and responsive diagrams |
| `server.mjs` | Local development server |
| `tests/` | Course, formula, state, and UI interaction checks |

When adding a lesson, give it a unique ID and keep its questions, flashcards, flow steps, and visual notes aligned with that lesson. Use its own topic's content for questions.

## Verify changes

Run `npm test` from this folder. The checks cover course completeness, mastery/quiz gates, scoring, remediation, formulas, all 32 lesson maps, the actual UI event handlers, and imported assets. Test output goes into `test-output/`; it is not required for hosting. The UI checks use a small DOM harness; check the finished layout in a real browser when editing styles.
