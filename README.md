# autobrancher
## A script for creating to_dev and to_qa" branch.

**The stepts:**

1. Identifies the **%task%** branch if you are on the **'%task%_to_dev'** or **'%task%_to_qa'** branch
2. Moves to the branch **%task%**
3. Pushes to origin the **%task%** branch
4. Creates the **%task%_to_qa** branch if it doesn't exist locally 
   or pulls it from the server if it exists upstream and moves to that branch.
5. Merges it with the **%task%** branch
6. Pulls from upstream **qa**
6. Creates the **%task%_to_dev** branch from the branch obtained at step **5**
7. Pulls from upstream **development** branch
8. Pushes the temporary branches to the server.
9. Deletes the temporary branches.
10. Displays the links for the pull requests with *target* and *destination* branches set up
## How to create the global command to run the script

- **Git Bash**
  
  *Add this string at the end of /etc/bash.bashrc:*
  
    alias autobrancher="node %PATH_TO_THE_REPO_FOLDER%/index.js"

- **Windows CMD/Powershell**

  Put the autobrancher.bat file in a PATH directory or [add the cloned directory to the PATH variable](https://helpdeskgeek.com/windows-10/add-windows-path-environment-variable/).
  
**DISCLAIMER**: *You have to reopen the old terminal window or VS Code (if you use the integrated terminal) in order to have access to the command*

**USAGE**

Just type *autobrancher* in your terminal.

In you encounter a conflict, resolve it, commit and retype *autobrancher* again in the terminal
