/**
 * Connectors Feature Module
 *
 * Manages AI tool connectors (e.g. Codex CLI, Claude Code).
 * Handles connector detection, configuration reading, and status display.
 *
 * @module features/connectors
 */

export { connectorService } from "./services/connectorService";
export { useConnectors } from "./hooks/useConnectors";
