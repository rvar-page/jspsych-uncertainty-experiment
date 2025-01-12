// Define initial parameters
let alpha = 48; // Starting guess for the threshold (noise intensity) (when noise dots are not normalized)
const beta = -0.00178; // Slope of the Weibull function (when noise dots are not normalized)
const gamma = 0.5; // Guess rate
const lambda = 0.02; // Lapse rate
const priorRange = Array.from({ length: 197 }, (_, i) => 4 + i); // Range of intensities [4, 200]

// Uniform prior
let pdf = Array(priorRange.length).fill(1 / priorRange.length); // Uniform distribution

// Weibull psychometric function
function weibull(params, x) {
    const { alpha, beta, gamma, lambda } = params;
    return gamma + (1 - gamma - lambda) * (1 - Math.exp(-Math.pow(x / alpha, beta)));
}

// Update posterior PDF
function updatePdf(pdf, alphas, response, x, params) {
    const likelihood = alphas.map(alpha => {
        const p = weibull({ ...params, alpha }, x);
        return response === 1 ? p : 1 - p; // Correct: p, Incorrect: 1-p
    });
    const updatedPdf = pdf.map((p, i) => p * likelihood[i]);
    const normalizationFactor = updatedPdf.reduce((sum, val) => sum + val, 0);
    return updatedPdf.map(p => p / normalizationFactor); // Normalize
}

// Estimate next noise intensity
function nextIntensity(pdf, alphas) {
    const index = pdf.indexOf(Math.max(...pdf)); // Choose mode of the posterior
    return alphas[index];
}

// Simulate responses and run QUEST
const responses = [1, 0, 1, 1, 0, 1, 0]; // Simulated user responses (1 = correct, 0 = incorrect)

responses.forEach((response, trial) => {
    const params = { beta, gamma, lambda };
    pdf = updatePdf(pdf, priorRange, response, alpha, params); // Update PDF based on response
    alpha = nextIntensity(pdf, priorRange); // Determine next intensity
    console.log(`Trial ${trial + 1}: Response = ${response}, Next Noise Intensity = ${Math.round(alpha)}`);
});
