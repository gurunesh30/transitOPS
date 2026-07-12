#!/bin/bash
# Agent Orchestrator CLI Wrapper
# Usage: ./orchestrator.sh <command> [args]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ORCHESTRATOR="${SCRIPT_DIR}/orchestrator.py"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if orchestrator exists
if [ ! -f "$ORCHESTRATOR" ]; then
    echo -e "${RED}Error: orchestrator.py not found at $ORCHESTRATOR${NC}"
    exit 1
fi

cd "$PROJECT_ROOT"

# Function to print usage
usage() {
    cat << EOF
Usage: $0 <command> [arguments]

AGENT ORCHESTRATOR COMMANDS:
  status                  Show project and all agents status
  agents                  List all configured agents
  features [--agent ID] [--status STATUS]  List features (filterable)
  
  start <feature_id> <agent_id>     Start a feature for an agent
  complete-task <feature_id> <task_index> <agent_id>  Mark task complete
  commit <feature_id> <agent_id> [-m "message"]  Commit feature changes
  finish <feature_id> <agent_id> [--no-push] [--pr]  Finish feature & push branch
  agent-status <agent_id>           Show detailed agent status

EXAMPLES:
  $0 status
  $0 agents
  $0 features --status pending
  $0 start feat-001 agent-1
  $0 complete-task feat-001 0 agent-1
  $0 commit feat-001 agent-1 -m "feat(vehicles): add CRUD endpoints"
  $0 finish feat-001 agent-1 --pr
  $0 agent-status agent-1

AGENTS:
  agent-1: Backend API Agent (feat/be-*)
  agent-2: Frontend UI Agent (feat/fe-*)
  agent-3: Database & Infra Agent (feat/db-*)
  agent-4: Testing & QA Agent (feat/qa-*)

FEATURES (pending):
  feat-001: Vehicle CRUD API Endpoints
  feat-002: Driver Management API
  feat-003: Trip Dispatch & Completion API
  feat-004: Dashboard Analytics API
  feat-005: Maintenance & Fuel Log APIs
  feat-006: Expense Tracking API
  feat-007: Dashboard UI - Fleet Overview
  feat-008: Vehicle Registry UI
  feat-009: Driver Management UI
  feat-010: Trip Management UI
  feat-011: Maintenance & Fuel Logs UI
  feat-012: Analytics & Reports UI

EOF
}

# Main command dispatcher
case "${1:-}" in
    status|agents|features)
        python3 "$ORCHESTRATOR" "$@"
        ;;
    start)
        if [ $# -ne 3 ]; then
            echo -e "${RED}Usage: $0 start <feature_id> <agent_id>${NC}"
            exit 1
        fi
        python3 "$ORCHESTRATOR" start "$2" "$3"
        ;;
    complete-task)
        if [ $# -ne 4 ]; then
            echo -e "${RED}Usage: $0 complete-task <feature_id> <task_index> <agent_id>${NC}"
            exit 1
        fi
        python3 "$ORCHESTRATOR" complete-task "$2" "$3" "$4"
        ;;
    commit)
        if [ $# -lt 3 ]; then
            echo -e "${RED}Usage: $0 commit <feature_id> <agent_id> [-m \"message\"]${NC}"
            exit 1
        fi
        python3 "$ORCHESTRATOR" commit "$2" "$3" "${@:4}"
        ;;
    finish)
        if [ $# -lt 3 ]; then
            echo -e "${RED}Usage: $0 finish <feature_id> <agent_id> [--no-push] [--pr]${NC}"
            exit 1
        fi
        python3 "$ORCHESTRATOR" finish "$2" "$3" "${@:4}"
        ;;
    agent-status)
        if [ $# -ne 2 ]; then
            echo -e "${RED}Usage: $0 agent-status <agent_id>${NC}"
            exit 1
        fi
        python3 "$ORCHESTRATOR" agent-status "$2"
        ;;
    help|--help|-h|"")
        usage
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        usage
        exit 1
        ;;
esac