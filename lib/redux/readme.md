##Redux-observable flow:

action -> reducer (change state) -> epic (work with changed state)

##Use cases for tester

* addTesterAction:
    -> reducer: add tester to state
      -> epic:
          - validate tester props and function
          - show notification and call removeTesterAction if an error occurred

* removeTesterAction:
    -> reducer: remove tester from state
      -> epic:
          - show notification and call stopTestAction if runningTest

* testAction:
    -> reducer: -
      -> epic:
          - check if running
          - call startTestAction

* startTestAction:
    -> reducer: running = true
      -> epic:
          - start testers
          - merge currentStateMessages with receivedMessages
          - call transformMessagesAction
          - call updateOutputAction
          - call finishTestAction

* updateMessagesAction:
    -> reducer: messages
      -> epic:
          - update ResultView
          - update decorations
          - update StatusBarTile

* updateOutputAction:
    -> reducer: output
      -> epic:
          - update consoleOutputView

* updateEditorAction:
    -> reducer: editor
      -> epic:
          - call transformMessagesAction 
          - call testAction (if runOnOpen setting)

* finishTestAction:
    -> reducer: runningTest = false
      -> epic:
          - update ResultView (waiting tile)
          - update consoleOutputView
          - update StatusBarTile

* stopTestAction:
    -> reducer: -
      -> epic:
          - stop testers
          - call finishTestAction

* setSortMessagesAction
    -> reducer: change sort key
      -> epic:
          - call transformMessagesAction

* setFilterMessagesAction
    -> reducer: change filter pattern
      -> epic:
          - call transformMessagesAction

* transformMessagesAction
    -> reducer: -
      -> epic:
          - filter messages
          - sort messages
          - call updateMessagesAction

* errorAction
    -> reducer: errorMessage
      -> epic:
          - show atom notification
          - call finishTestAction
