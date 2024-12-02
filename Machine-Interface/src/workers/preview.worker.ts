import { Constants } from 'src/constants';
import {
  convertGCodeToLines,
  getGraphBoundingBoxMetrics,
  getJobStartPoint,
  resetParserState,
} from 'src/services/draw.gcode.service/draw.gcode.helper.service';
addEventListener('message', async (event) => {
  try {
    if (event.data) {
      let gcodeStr = event.data.gcodeStr;
      const config = event.data.config;

      // before start the parse of the gcode string reset the parser state
      resetParserState();

      // Check if the file is bigger than the platform
      const platformWidth = Math.abs(
        config.machine_platform.end_point.x -
          config.machine_platform.start_point.x
      );
      const platformHeight = Math.abs(
        config.machine_platform.end_point.y -
          config.machine_platform.start_point.y
      );

      // Split the G-code string into lines
      const gcodeLines = gcodeStr.split('\n');
      gcodeStr = null;
      const totalLines = gcodeLines.length;

      let currentIndex = 0;

      while (currentIndex < totalLines) {
        // Get the current batch of lines
        const batch = gcodeLines.slice(
          currentIndex,
          currentIndex + Constants.PREVIEWER_WORKER_BATCH_SIZE
        );

        // Convert the current batch to lines with state
        const linesToDraw = convertGCodeToLines(batch.join('\n'));

        // Get the bounding box metrics for this batch and check if its bigger that the platform
        const { maxWidth, maxHeight } = getGraphBoundingBoxMetrics();

        let respond = {};
        if (maxWidth <= platformWidth && maxHeight <= platformHeight) {
          // Respond with the current batch of lines
          respond = {
            linesToDraw: linesToDraw,
            isBiggerThanPlatform: false,
            done: false,
          };

          postMessage(respond);
          // Move to the next batch
          currentIndex += Constants.PREVIEWER_WORKER_BATCH_SIZE;
        } else {
          // bigger than the platform exit the loop
          respond = {
            linesToDraw: linesToDraw,
            isBiggerThanPlatform: true,
            done: true,
          };

          postMessage(respond);
          break;
        }
      }
      const startPoint = getJobStartPoint();
      // Notify that processing is complete
      postMessage({ done: true, startPoint });
      self.close();
    }
  } catch (error) {
    postMessage({ error });
  }
});
