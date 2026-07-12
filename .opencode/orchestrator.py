#!/usr/bin/env python3
"""
Agent Orchestrator for TransitOps Platform
Manages 4 AI agents working on the same project with git workflow automation.
"""

import json
import subprocess
import sys
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

class AgentRole(Enum):
    BACKEND_API = "backend-api"
    FRONTEND_UI = "frontend-ui"
    DATABASE_INFRA = "database-infra"
    TESTING_QA = "testing-qa"

class FeatureStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    COMPLETED = "completed"
    BLOCKED = "blocked"

class AgentStatus(Enum):
    IDLE = "idle"
    WORKING = "working"
    BLOCKED = "blocked"
    COMPLETED = "completed"

@dataclass
class Agent:
    id: str
    name: str
    role: AgentRole
    branch_prefix: str
    status: AgentStatus = AgentStatus.IDLE
    current_feature: Optional[str] = None
    completed_features: List[str] = None

    def __post_init__(self):
        if self.completed_features is None:
            self.completed_features = []

@dataclass
class Feature:
    id: str
    title: str
    description: str
    agent_id: str
    agent_role: AgentRole
    branch: str
    status: FeatureStatus = FeatureStatus.PENDING
    priority: str = "medium"
    dependencies: List[str] = None
    tasks: List[Dict] = None
    commits: List[Dict] = None
    created_at: str = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None

    def __post_init__(self):
        if self.dependencies is None:
            self.dependencies = []
        if self.tasks is None:
            self.tasks = []
        if self.commits is None:
            self.commits = []
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()

class AgentOrchestrator:
    def __init__(self, project_root: str = "/home/arthurmorgan/transitops-platform"):
        self.project_root = Path(project_root)
        self.tasks_file = self.project_root / ".opencode" / "tasks.json"
        self.agents_file = self.project_root / ".opencode" / "agents.json"
        self.log_file = self.project_root / ".opencode" / "orchestrator.log"
        
        self.agents: Dict[str, Agent] = {}
        self.features: Dict[str, Feature] = {}
        
        self._load_config()
        self._setup_git()

    def _load_config(self):
        """Load agents and features from config files"""
        # Load agents
        if self.agents_file.exists():
            with open(self.agents_file) as f:
                data = json.load(f)
                for agent_data in data.get("agents", []):
                    agent = Agent(
                        id=agent_data["id"],
                        name=agent_data["name"],
                        role=AgentRole(agent_data["role"]),
                        branch_prefix=agent_data.get("branchPrefix", agent_data.get("branch_prefix", "")),
                        status=AgentStatus(agent_data.get("status", "idle")),
                        current_feature=agent_data.get("current_feature"),
                        completed_features=agent_data.get("completed_features", [])
                    )
                    self.agents[agent.id] = agent
        else:
            self._create_default_agents()

        # Load features
        if self.tasks_file.exists():
            with open(self.tasks_file) as f:
                data = json.load(f)
                for feat_data in data.get("features", []):
                    # Normalize tasks to dict format
                    tasks = feat_data.get("tasks", [])
                    normalized_tasks = []
                    for t in tasks:
                        if isinstance(t, str):
                            normalized_tasks.append({"title": t, "completed": False})
                        else:
                            normalized_tasks.append(t)
                    
                    feature = Feature(
                        id=feat_data["id"],
                        title=feat_data["title"],
                        description=feat_data["description"],
                        agent_id=feat_data.get("agentId", feat_data.get("agent_id")),
                        agent_role=AgentRole(feat_data.get("agentRole", feat_data.get("agent_role"))),
                        branch=feat_data["branch"],
                        status=FeatureStatus(feat_data.get("status", "pending")),
                        priority=feat_data.get("priority", "medium"),
                        dependencies=feat_data.get("dependencies", []),
                        tasks=normalized_tasks,
                        commits=feat_data.get("commits", []),
                        created_at=feat_data.get("created_at"),
                        started_at=feat_data.get("started_at"),
                        completed_at=feat_data.get("completed_at")
                    )
                    self.features[feature.id] = feature

    def _create_default_agents(self):
        """Create the 4 default agents for the project"""
        self.agents = {
            "agent-1": Agent(
                id="agent-1",
                name="Backend API Agent",
                role=AgentRole.BACKEND_API,
                branch_prefix="feat/be-"
            ),
            "agent-2": Agent(
                id="agent-2",
                name="Frontend UI Agent",
                role=AgentRole.FRONTEND_UI,
                branch_prefix="feat/fe-"
            ),
            "agent-3": Agent(
                id="agent-3",
                name="Database & Infra Agent",
                role=AgentRole.DATABASE_INFRA,
                branch_prefix="feat/db-"
            ),
            "agent-4": Agent(
                id="agent-4",
                name="Testing & QA Agent",
                role=AgentRole.TESTING_QA,
                branch_prefix="feat/qa-"
            )
        }
        self._save_agents()

    def _save_agents(self):
        """Save agents to config file"""
        data = {
            "agents": [
                {
                    "id": a.id,
                    "name": a.name,
                    "role": a.role.value,
                    "branch_prefix": a.branch_prefix,
                    "status": a.status.value,
                    "current_feature": a.current_feature,
                    "completed_features": a.completed_features
                }
                for a in self.agents.values()
            ]
        }
        self.agents_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.agents_file, "w") as f:
            json.dump(data, f, indent=2)

    def _save_features(self):
        """Save features to tasks file"""
        data = {
            "features": [
                {
                    "id": f.id,
                    "title": f.title,
                    "description": f.description,
                    "agent_id": f.agent_id,
                    "agent_role": f.agent_role.value,
                    "branch": f.branch,
                    "status": f.status.value,
                    "priority": f.priority,
                    "dependencies": f.dependencies,
                    "tasks": f.tasks,
                    "commits": f.commits,
                    "created_at": f.created_at,
                    "started_at": f.started_at,
                    "completed_at": f.completed_at
                }
                for f in self.features.values()
            ],
            "workflow": {
                "currentSprint": "sprint-1",
                "sprintGoals": [
                    "Complete backend API foundation",
                    "Complete frontend dashboard and core views",
                    "Set up database schema and infrastructure",
                    "Establish testing foundation"
                ],
                "completedFeatures": [],
                "inProgressFeatures": [],
                "blockedFeatures": []
            }
        }
        self.tasks_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.tasks_file, "w") as f:
            json.dump(data, f, indent=2)

    def _setup_git(self):
        """Initialize git if needed"""
        os.chdir(self.project_root)
        result = subprocess.run(["git", "status"], capture_output=True)
        if result.returncode != 0:
            subprocess.run(["git", "init"], check=True)
            subprocess.run(["git", "add", "."], check=True)
            subprocess.run(["git", "commit", "-m", "Initial commit"], check=True)

    def _run_git(self, *args, check=True) -> subprocess.CompletedProcess:
        """Run a git command"""
        result = subprocess.run(["git"] + list(args), capture_output=True, text=True, cwd=self.project_root)
        if check and result.returncode != 0:
            raise RuntimeError(f"Git command failed: {' '.join(args)}\n{result.stderr}")
        return result

    def _log(self, message: str):
        """Log message to file and stdout"""
        timestamp = datetime.now().isoformat()
        log_msg = f"[{timestamp}] {message}"
        print(log_msg)
        with open(self.log_file, "a") as f:
            f.write(log_msg + "\n")

    def list_agents(self) -> List[Agent]:
        """List all agents"""
        return list(self.agents.values())

    def list_features(self, agent_id: Optional[str] = None, status: Optional[FeatureStatus] = None) -> List[Feature]:
        """List features with optional filters"""
        features = list(self.features.values())
        if agent_id:
            features = [f for f in features if f.agent_id == agent_id]
        if status:
            features = [f for f in features if f.status == status]
        return features

    def get_feature(self, feature_id: str) -> Optional[Feature]:
        """Get a feature by ID"""
        return self.features.get(feature_id)

    def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Get an agent by ID"""
        return self.agents.get(agent_id)

    def start_feature(self, feature_id: str, agent_id: str) -> bool:
        """Start working on a feature"""
        feature = self.get_feature(feature_id)
        agent = self.get_agent(agent_id)
        
        if not feature or not agent:
            self._log(f"ERROR: Feature {feature_id} or Agent {agent_id} not found")
            return False

        # Check dependencies
        for dep_id in feature.dependencies:
            dep = self.get_feature(dep_id)
            if dep and dep.status != FeatureStatus.COMPLETED:
                self._log(f"ERROR: Dependency {dep_id} not completed")
                return False

        # Check if agent is available
        if agent.status == AgentStatus.WORKING and agent.current_feature != feature_id:
            self._log(f"ERROR: Agent {agent_id} is already working on {agent.current_feature}")
            return False

        # Create feature branch
        self._run_git("checkout", "main")
        self._run_git("pull", "origin", "main")
        self._run_git("checkout", "-b", feature.branch)

        # Update status
        feature.status = FeatureStatus.IN_PROGRESS
        feature.started_at = datetime.now().isoformat()
        agent.status = AgentStatus.WORKING
        agent.current_feature = feature_id
        
        self._save_features()
        self._save_agents()
        
        self._log(f"STARTED: Agent {agent.name} ({agent_id}) started feature {feature.title} ({feature_id}) on branch {feature.branch}")
        return True

    def complete_task(self, feature_id: str, task_index: int, agent_id: str) -> bool:
        """Mark a task as completed"""
        feature = self.get_feature(feature_id)
        agent = self.get_agent(agent_id)
        
        if not feature or not agent:
            return False
        
        if agent.current_feature != feature_id:
            self._log(f"ERROR: Agent {agent_id} not assigned to feature {feature_id}")
            return False

        if 0 <= task_index < len(feature.tasks):
            feature.tasks[task_index]["completed"] = True
            feature.tasks[task_index]["completed_at"] = datetime.now().isoformat()
            feature.tasks[task_index]["completed_by"] = agent_id
            self._save_features()
            self._log(f"TASK COMPLETE: {feature.tasks[task_index]['title']} in {feature.title}")
            return True
        return False

    def commit_feature(self, feature_id: str, agent_id: str, message: Optional[str] = None) -> bool:
        """Commit changes for a feature"""
        feature = self.get_feature(feature_id)
        agent = self.get_agent(agent_id)
        
        if not feature or not agent:
            return False
        
        if agent.current_feature != feature_id:
            self._log(f"ERROR: Agent {agent_id} not working on feature {feature_id}")
            return False

        # Stage all changes
        self._run_git("add", ".")
        
        # Check if there are changes
        status = self._run_git("status", "--porcelain", check=False)
        if not status.stdout.strip():
            self._log(f"WARNING: No changes to commit for feature {feature_id}")
            return False

        # Create commit message
        if not message:
            completed_tasks = [t for t in feature.tasks if t.get("completed")]
            task_summary = ", ".join([t["title"] for t in completed_tasks[-3:]])
            message = f"feat({feature.branch.split('/')[-1]}): {feature.title}"
            if task_summary:
                message += f" - {task_summary}"

        # Commit
        self._run_git("commit", "-m", message)
        
        # Record commit
        commit_hash = self._run_git("rev-parse", "HEAD").stdout.strip()
        commit_info = {
            "hash": commit_hash,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "agent_id": agent_id
        }
        feature.commits.append(commit_info)
        
        self._save_features()
        self._log(f"COMMITTED: {message} ({commit_hash[:8]}) by {agent.name}")
        return True

    def finish_feature(self, feature_id: str, agent_id: str, push: bool = True, create_pr: bool = False) -> bool:
        """Mark feature as complete and optionally push/create PR"""
        feature = self.get_feature(feature_id)
        agent = self.get_agent(agent_id)
        
        if not feature or not agent:
            return False

        if agent.current_feature != feature_id:
            self._log(f"ERROR: Agent {agent_id} not working on feature {feature_id}")
            return False

        # Check all tasks completed
        incomplete = [t for t in feature.tasks if not t.get("completed")]
        if incomplete:
            self._log(f"WARNING: Feature {feature_id} has {len(incomplete)} incomplete tasks")

        # Push branch
        if push:
            self._run_git("push", "-u", "origin", feature.branch)
            self._log(f"PUSHED: Branch {feature.branch} pushed to origin")

        # Update status
        feature.status = FeatureStatus.COMPLETED
        feature.completed_at = datetime.now().isoformat()
        agent.status = AgentStatus.IDLE
        agent.current_feature = None
        agent.completed_features.append(feature_id)
        
        self._save_features()
        self._save_agents()
        
        self._log(f"COMPLETED: Feature {feature.title} ({feature_id}) completed by {agent.name}")
        
        # Switch back to main
        self._run_git("checkout", "main")
        
        return True

    def get_agent_status(self, agent_id: str) -> Dict:
        """Get detailed status for an agent"""
        agent = self.get_agent(agent_id)
        if not agent:
            return {}
        
        current_feature = None
        if agent.current_feature:
            current_feature = self.get_feature(agent.current_feature)
        
        tasks_completed = 0
        tasks_total = 0
        if current_feature:
            tasks_total = len(current_feature.tasks)
            for t in current_feature.tasks:
                if isinstance(t, dict) and t.get("completed"):
                    tasks_completed += 1
                elif isinstance(t, str):
                    # Legacy string format - can't track completion
                    pass
        
        return {
            "agent": {
                "id": agent.id,
                "name": agent.name,
                "role": agent.role.value,
                "status": agent.status.value,
                "branch_prefix": agent.branch_prefix
            },
            "current_feature": {
                "id": current_feature.id,
                "title": current_feature.title,
                "branch": current_feature.branch,
                "status": current_feature.status.value,
                "tasks_completed": tasks_completed,
                "tasks_total": tasks_total,
                "commits": len(current_feature.commits)
            } if current_feature else None,
            "completed_features": agent.completed_features
        }

    def get_project_status(self) -> Dict:
        """Get overall project status"""
        total_features = len(self.features)
        completed = len([f for f in self.features.values() if f.status == FeatureStatus.COMPLETED])
        in_progress = len([f for f in self.features.values() if f.status == FeatureStatus.IN_PROGRESS])
        pending = len([f for f in self.features.values() if f.status == FeatureStatus.PENDING])
        blocked = len([f for f in self.features.values() if f.status == FeatureStatus.BLOCKED])
        
        agents_status = {aid: self.get_agent_status(aid) for aid in self.agents}
        
        return {
            "project": "TransitOps Platform",
            "total_features": total_features,
            "completed": completed,
            "in_progress": in_progress,
            "pending": pending,
            "blocked": blocked,
            "completion_rate": f"{(completed/total_features*100):.1f}%" if total_features > 0 else "0%",
            "agents": agents_status,
            "features_by_agent": {
                role.value: [f.id for f in self.features.values() if f.agent_role == role]
                for role in AgentRole
            }
        }

    def print_status(self):
        """Print formatted project status"""
        status = self.get_project_status()
        
        print("\n" + "="*70)
        print(f"  {status['project']} - Agent Orchestrator Status")
        print("="*70)
        print(f"  Features: {status['total_features']} total | {status['completed']} done | {status['in_progress']} in progress | {status['pending']} pending | {status['blocked']} blocked")
        print(f"  Completion: {status['completion_rate']}")
        print("-"*70)
        
        for agent_id, agent_status in status["agents"].items():
            agent = agent_status["agent"]
            cf = agent_status["current_feature"]
            print(f"\n  🤖 {agent['name']} ({agent['role']}) - {agent['status'].upper()}")
            if cf:
                print(f"     Current: {cf['title']} ({cf['id']})")
                print(f"     Branch:  {cf['branch']}")
                print(f"     Progress: {cf['tasks_completed']}/{cf['tasks_total']} tasks | {cf['commits']} commits")
            else:
                print(f"     Current: (none)")
            if agent_status["completed_features"]:
                print(f"     Completed: {', '.join(agent_status['completed_features'])}")

        print("\n" + "="*70)

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Agent Orchestrator for TransitOps Platform")
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Status
    subparsers.add_parser("status", help="Show project and agent status")
    
    # List agents
    subparsers.add_parser("agents", help="List all agents")
    
    # List features
    list_features = subparsers.add_parser("features", help="List features")
    list_features.add_argument("--agent", help="Filter by agent ID")
    list_features.add_argument("--status", help="Filter by status (pending/in_progress/completed/blocked)")
    
    # Start feature
    start = subparsers.add_parser("start", help="Start a feature")
    start.add_argument("feature_id", help="Feature ID to start")
    start.add_argument("agent_id", help="Agent ID to assign")
    
    # Complete task
    complete_task = subparsers.add_parser("complete-task", help="Mark a task as complete")
    complete_task.add_argument("feature_id", help="Feature ID")
    complete_task.add_argument("task_index", type=int, help="Task index (0-based)")
    complete_task.add_argument("agent_id", help="Agent ID")
    
    # Commit
    commit = subparsers.add_parser("commit", help="Commit feature changes")
    commit.add_argument("feature_id", help="Feature ID")
    commit.add_argument("agent_id", help="Agent ID")
    commit.add_argument("-m", "--message", help="Commit message")
    
    # Finish feature
    finish = subparsers.add_parser("finish", help="Finish a feature")
    finish.add_argument("feature_id", help="Feature ID")
    finish.add_argument("agent_id", help="Agent ID")
    finish.add_argument("--no-push", action="store_true", help="Don't push to remote")
    finish.add_argument("--pr", action="store_true", help="Create PR (not implemented)")
    
    # Agent status
    agent_status = subparsers.add_parser("agent-status", help="Get detailed agent status")
    agent_status.add_argument("agent_id", help="Agent ID")
    
    args = parser.parse_args()
    
    orchestrator = AgentOrchestrator()
    
    if args.command == "status":
        orchestrator.print_status()
    elif args.command == "agents":
        for agent in orchestrator.list_agents():
            print(f"  {agent.id}: {agent.name} ({agent.role.value}) - {agent.status.value}")
    elif args.command == "features":
        status_filter = FeatureStatus(args.status) if args.status else None
        features = orchestrator.list_features(args.agent, status_filter)
        for f in features:
            print(f"  {f.id}: {f.title} [{f.status.value}] - {f.branch} (agent: {f.agent_id})")
    elif args.command == "start":
        if orchestrator.start_feature(args.feature_id, args.agent_id):
            print(f"Started feature {args.feature_id} for agent {args.agent_id}")
        else:
            print(f"Failed to start feature {args.feature_id}")
            sys.exit(1)
    elif args.command == "complete-task":
        if orchestrator.complete_task(args.feature_id, args.task_index, args.agent_id):
            print(f"Task {args.task_index} completed for feature {args.feature_id}")
        else:
            print(f"Failed to complete task")
            sys.exit(1)
    elif args.command == "commit":
        if orchestrator.commit_feature(args.feature_id, args.agent_id, args.message):
            print(f"Committed feature {args.feature_id}")
        else:
            print(f"Failed to commit feature")
            sys.exit(1)
    elif args.command == "finish":
        if orchestrator.finish_feature(args.feature_id, args.agent_id, push=not args.no_push):
            print(f"Feature {args.feature_id} completed!")
        else:
            print(f"Failed to finish feature")
            sys.exit(1)
    elif args.command == "agent-status":
        status = orchestrator.get_agent_status(args.agent_id)
        print(json.dumps(status, indent=2))
    else:
        parser.print_help()

if __name__ == "__main__":
    main()