# autobrancher
## A script for creating to_dev and to_qa" branch.

**The stepts:**

1. Identifies the **%task%** branch if you are on the **'%task%_to_dev'** or **'%task%_to_qa'** branch
2. Moves to the branch **%task%**
3. Pushes the changes of the **%task%** branch
4. Creates the **%task%_to_dev**/**%task%_to_qa** branch or pulls it from the server if it exists upstream
   and moves to that branch
5. Merges it with the **%task%** branch
6. Pulls from upstream **development/qa**
7. Pushes the temporary branches to the server.
8. Deletes the temporary branches.
## How to create the global command to run the script

- **Git Bash**
  
  *Add this string at the end of /etc/bash.bashrc:*
  
    alias autobrancher="node %PATH_TO_THE_REPO_FOLDER%/index.js"
    
    Reopen the terminal/VS Code

- **Windows CMD/Powershell**

  Put the autobrancher.bat file in a PATH directory or add the cloned directory to the PATH variable.
  
  Reopen the terminal/VS Code
