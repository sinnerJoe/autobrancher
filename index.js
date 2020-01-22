const cp = require('child_process');
const process = require("process")
const fs = require('fs');

const fetchRemoteBranches = () => cp.execSync("git fetch -p --all", {stdio: ['ignore', 'pipe', 'pipe']},).toString();

const createBranch = (branchName) => {
    return cp.execSync(`git checkout -b ${branchName}`).toString();
}

const deleteBranch = (branchName) => {
    console.log(`git branch -D ${branchName}`)
    return cp.execSync(`git branch -D ${branchName}`).toString();
}

const moveToBranch = (branchName) => {
    return cp.execSync(`git checkout ${branchName}`).toString();
}

const pullFrom = (branchName) => {
    return cp.execSync(`git pull origin ${branchName}`, {stdio:'pipe'}).toString();
}

const mergeWith = (branchName) => {
    if (!['qa', 'development', 'master'].includes(branchName))
         return cp.execSync(`git merge ${branchName}`).toString();
    else return pullFrom(branchName);
}

const pushTo = (branchName) => {
    return cp.execSync(`git push origin ${branchName}`).toString()
}

const getBranchList = () => {
    const stdout = cp.execSync(`git branch`);
    const branchList = stdout.toString().split('\n').map(s => s.trim());
    return branchList
}

const getRemoteBranchList = () => {
    const stdout = cp.execSync(`git branch -r`);
    const branchList = stdout.toString().split('\n').map(s => s.trim());
    return branchList
}

const getCurrentBranch = () => {
    const branchList = getBranchList();
    for(const branch of branchList.map(b => b.trim())){
        if(branch[0] == '*')
            return branch.slice(2)
    }
}

const getReponame = () => {
    const stdout = cp.execSync('git remote get-url origin');
    const reg = /git@bitbucket.org:adminme\/([-\w\d_]+).git/;
    const match = stdout.toString().match(reg);
    if(match && typeof match[1] == 'string'){
        return match[1];
    } else {
        return null;
    }
}

const branchExistsLocaly = (soughtBranch) => {
    const branchList = getBranchList();
    for(const branch of branchList){
        if (branch.includes(soughtBranch)){
            return true;
        }
    }
    return false
}

const branchExistsRemotely = (soughtBranch) => {
    const branchList = getRemoteBranchList();
    for(const branch of branchList){
        if (branch.includes(soughtBranch)){
            return true;
        }
    }
    return false
}

const findMainBranch = () => {
    const toDevReg = /([\d\w-_]+?)_to_dev/;
    const toQaReg = /([\d\w-_]+?)_to_qa/;
    let mainBranch = getCurrentBranch()
    for (const reg of [toDevReg, toQaReg]) {
        if (mainBranch.match(reg)) {
            mainBranch = mainBranch.replace(reg, "$1");
            break;
        }
    }
    return mainBranch
}


if (process.argv.length > 4) {
    throw "Too many arguments"
} 

if (process.argv.length == 4 && process.argv[2] == '--all'){

}


let mainBranch = findMainBranch();

const toDevBranch = `${mainBranch}_to_dev`;
const toQaBranch = `${mainBranch}_to_qa`;

if (process.argv.length === 3) {
    console.log("CONDITION " + process.argv[2])
    if(process.argv[2] === 'clean'){
        moveToBranch(mainBranch);
        for(const branch of [toDevBranch, toQaBranch]){
            try{
                deleteBranch(branch);
            }catch(err){}
        }
        process.exit(0);
    }
} 

if(['master', 'qa', 'development'].includes(mainBranch)){
    console.log(`You can't create secondary branches from ${mainBranch}.`)
    console.log(`Please move to the branch of your task`)
    process.exit(1);
    return 1;
}

fetchRemoteBranches();

try{
        pushTo(mainBranch);
        moveToBranch(mainBranch)
        pullFrom('master')
        publishTemporaryBranch(toQaBranch, 'qa', toQaBranch);
        publishTemporaryBranch(toDevBranch, 'development', 'qa');
        moveToBranch(mainBranch)
        deleteBranch(toQaBranch);
        deleteBranch(toDevBranch);
        const reponame = getReponame();
        if(!reponame) return;
        console.log('\n\n========Pull request links============');
        console.log(`To dev:`);
        console.log(`https://bitbucket.org/adminme/${reponame}/pull-requests/new?source=${toDevBranch}&dest=development`);
        console.log(`To qa:`);
        console.log(`https://bitbucket.org/adminme/${reponame}/pull-requests/new?source=${toQaBranch}&dest=qa`);
		console.log('To master:');
		console.log(`https://bitbucket.org/adminme/${reponame}/pull-requests/new?source=${mainBranch}&dest=master`);

}catch(err){
    console.log("CHECK OUT THE ERROR")
}


function publishTemporaryBranch(branch, pullTarget, prevBranch) {

    try {

        if (!branchExistsLocaly(branch)) {
            console.log(`Branch ${branch} created!`)
            createBranch(branch)
        }
        else {
            moveToBranch(branch)
        }

        if (branchExistsRemotely(branch)) pullFrom(branch);
        pullFrom(pullTarget)
        mergeWith(prevBranch)
        pushTo(branch)
        moveToBranch(prevBranch)
    } catch (err) {
        console.log("ERROR " + err.message);
        if (err.message.includes("Command failed: git pull origin")) {
            console.log(`Conflict on branch "${branch}" after pulling from "${pullTarget}"`)
            throw err
        }
    }
}

function repeatForSubfolders(command){
    return 0
}